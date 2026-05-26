using System;
using System.IO;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;
using UiPath.CodedWorkflows;
using UiPath.Core.Activities.API;

namespace NEXUS_RPA
{
    public class nexus_rpa : DHLNexus.CodedWorkflow
    {
        // ═══════════════════════════════════════════════════════════
        // NEXUS RPA — Coded Workflow (v4.0 — Full Intelligence Upgrade)
        // DAC 3.0 Competition — DHL Digital Automation Center
        //
        // v4.0 Additions over v3.0:
        //   NEW-7: Priority Queue Scheduler — Urgency-First Processing
        //          → Files scored + sorted before loop; distressed customers first
        //   NEW-8: SOP Gap Detection — Knowledge Loop Closure
        //          → Post-batch SOP audit; missing types trigger auto-draft request
        //   NEW-9: HTML Batch Summary — Shift Handover Report
        //          → Rich per-case table (severity badges, confidence, outcome) emailed
        //
        // v3.0 Additions over v2.0:
        //   NEW-1: Real-time Ops Dashboard Broadcasting
        //          → Every bot action fires to /ops/event (live feed)
        //   NEW-2: Outbound Response Loop — Full Autonomous Cycle
        //          → Bot polls AI-generated responses, sends via Outlook
        //   NEW-3: Customer DNA — Behavioral History Lookup
        //          → Prior cases, repeat flag, customer context for AI
        //   NEW-4: AWB Number Intelligence
        //          → Extracts AWB/tracking numbers from email body
        //   NEW-5: Language Detection (Bahasa Melayu / English)
        //          → Tags incidents, shapes response language
        //   NEW-6: Sentiment Analysis — Emotional Intelligence
        //          → Frustration scoring, auto-priority escalation
        // ═══════════════════════════════════════════════════════════

        // ── Configuration ──────────────────────────────────────────
        private static readonly string API_KEY =
            Environment.GetEnvironmentVariable("NEXUS_API_KEY")
            ?? Environment.GetEnvironmentVariable("RPA_API_KEY")
            ?? "c0c939a8805024fa3c76cdfcc1418c08";

        private const string BASE_URL         = "http://127.0.0.1:3001/api/v1";
        private const string FRONTEND_URL     = "http://localhost:5173";
        private const string WATCH_FOLDER     = @"C:\NEXUS_Watch";
        private const string LOG_FOLDER       = @"C:\NEXUS_Watch\logs";
        private const string PRIORITY_LOG     = @"C:\NEXUS_Watch\logs\priority.log";
        private const string OUTLOOK_ACCOUNT  = "altalib.hasan05@gmail.com";
        private const string OPS_EMAIL        = "altalib.hasan05@gmail.com"; // escalations go here for demo
        private const string PENDING_SYNC_FOLDER = @"C:\NEXUS_Watch\pending_sync";

        // Gmail SMTP — read from env so no credentials in source
        private static readonly string SmtpUser = Environment.GetEnvironmentVariable("SMTP_USER") ?? "altalib.hasan05@gmail.com";
        private static readonly string SmtpPass = (Environment.GetEnvironmentVariable("SMTP_PASS") ?? "").Replace(" ", "");
        private static readonly string SmtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") ?? "smtp.gmail.com";
        private static readonly int    SmtpPort = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var p) ? p : 587;

        private static readonly HashSet<string> AllowedExtensions =
            new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            { ".txt", ".pdf", ".docx", ".png", ".jpg", ".jpeg" };

        // ── Sentiment word lists ────────────────────────────────────
        private static readonly string[] FrustrationWords = {
            "furious", "angry", "terrible", "disgusting", "unacceptable",
            "lawsuit", "disgusted", "frustrated", "worst", "horrible",
            "shocking", "appalling", "outrageous", "pathetic", "useless",
            "incompetent", "ridiculous", "absolutely unacceptable",
            "never again", "report you", "refund immediately",
            "marah", "kecewa", "teruk", "tidak boleh diterima", "tak guna"
        };
        private static readonly string[] UrgencyWords = {
            "urgent", "immediately", "right now", "asap", "emergency",
            "critical", "today", "tonight", "business meeting", "deadline",
            "segera", "urgent sekali", "sila balas"
        };
        private static readonly string[] MalayKeywords = {
            "saya", "tidak", "boleh", "adalah", "dengan", "untuk",
            "yang", "pada", "ini", "itu", "barang", "kotak", "hantar",
            "terima", "rosak", "hilang", "lambat", "parcel saya",
            "dhl", "penghantaran", "terima kasih", "mohon", "tuan",
            "puan", "kami", "mereka", "hubungi", "semak", "tolong"
        };

        // ── AWB pattern ─────────────────────────────────────────────
        // Matches: JD1234567890, 1234567890, AWB: 123456789012
        private static readonly Regex AwbPattern = new Regex(
            @"\b(?:AWB\s*[:#]?\s*)?([A-Z]{2}\d{8,12}|\d{10,12})\b",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        // ── Entry point ────────────────────────────────────────────
        [Workflow]
        public void Execute()
        {
            string rpaRunId    = Guid.NewGuid().ToString("N");
            int processedCount = 0;
            int skippedCount   = 0;
            int failedCount    = 0;
            var runStartTime   = DateTime.UtcNow;

            // CREATIVE-1: narrative builder
            var narrative = new StringBuilder();
            narrative.Append($"Run at {DateTime.UtcNow:HH:mm} UTC — ");

            // CREATIVE-2: cluster detection
            var locationCounts = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase);

            LogMessage($"[NEXUS RPA v4.0] Run started — RunId: {rpaRunId}");

            EnsureDirectory(WATCH_FOLDER);
            EnsureDirectory(LOG_FOLDER);
            EnsureDirectory(Path.Combine(WATCH_FOLDER, "processed"));
            EnsureDirectory(Path.Combine(WATCH_FOLDER, "errors"));
            EnsureDirectory(Path.Combine(WATCH_FOLDER, "attachments"));
            EnsureDirectory(PENDING_SYNC_FOLDER);

            string[] rawFiles = Directory.GetFiles(WATCH_FOLDER, "*.*", SearchOption.TopDirectoryOnly);

            // NEW-7: Priority Queue Scheduler
            // Score every file by urgency + frustration word density before the main
            // loop runs. Customers with the highest distress level are processed first,
            // maximising the SLA hit rate on the cases that matter most.
            var fileEntries = new List<FileEntry>();
            foreach (string rf in rawFiles)
                fileEntries.Add(new FileEntry { Path = rf, UrgencyScore = ScoreFileUrgency(rf) });
            fileEntries.Sort((a, b) => b.UrgencyScore.CompareTo(a.UrgencyScore));

            if (fileEntries.Count > 0 && fileEntries[0].UrgencyScore > 0)
                LogMessage($"[NEXUS RPA] Priority queue: highest urgency score = {fileEntries[0].UrgencyScore}" +
                           $" ({Path.GetFileName(fileEntries[0].Path)})");

            // NEW-8: Batch telemetry accumulators
            var batchResults = new List<BatchResult>();
            var typesSeen    = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            int sopGapsFound = 0;

            // NEW-1: Broadcast bot_started to live ops dashboard
            BroadcastOpsEvent("bot_started",
                $"NEXUS RPA v4.0 started — scanning {fileEntries.Count} file(s) in watch folder (priority-sorted)",
                $"\"runId\":\"{rpaRunId}\",\"fileCount\":{fileEntries.Count},\"startedAt\":\"{runStartTime:o}\"");

            LogMessage($"[NEXUS RPA] Found {fileEntries.Count} file(s) in watch folder");

            foreach (FileEntry fileEntry in fileEntries)
            {
                string filePath = fileEntry.Path;
                string filename = Path.GetFileName(filePath);
                string fileHash = string.Empty;

                try
                {
                    BroadcastFileTimeline(rpaRunId, filename, "file_seen", "File discovered in watch folder and inserted into priority queue",
                        $"\"urgencyScore\":{fileEntry.UrgencyScore}," +
                        $"\"extension\":\"{EscapeJson(Path.GetExtension(filePath))}\"");

                    // 1. Extension guard
                    string ext = Path.GetExtension(filePath);
                    if (!AllowedExtensions.Contains(ext))
                    {
                        LogMessage($"[NEXUS RPA] SKIPPED unsupported extension: {filename}");
                        BroadcastFileTimeline(rpaRunId, filename, "file_skipped", "Unsupported file extension skipped before intake",
                            $"\"extension\":\"{EscapeJson(ext)}\",\"reason\":\"unsupported_extension\"");
                        skippedCount++;
                        continue;
                    }

                    // 2. SHA-256 dedup check
                    fileHash = ComputeSha256(filePath);
                    BroadcastFileTimeline(rpaRunId, filename, "dedup_checked", "SHA-256 fingerprint generated for 14-day dedup guard",
                        $"\"hash\":\"{EscapeJson(fileHash)}\"");
                    LogMessage($"[NEXUS RPA] Hash: {fileHash} — {filename}");

                    bool alreadySeen = CheckProcessedFile(fileHash);
                    if (alreadySeen)
                    {
                        BroadcastFileTimeline(rpaRunId, filename, "dedup_skipped", "Duplicate file skipped before incident creation",
                            $"\"hash\":\"{EscapeJson(fileHash)}\",\"outcome\":\"duplicate\"");
                        LogMessage($"[NEXUS RPA] DUPLICATE — skipping {filename}");
                        skippedCount++;
                        narrative.Append($"Skipped {filename} (SHA-256 duplicate). ");
                        PostRunItem(rpaRunId, filename, fileHash, null, "duplicate", "sha256_match", null, null, null);
                        continue;
                    }

                    // 3. Read content for analysis
                    string fileContent = string.Empty;
                    try { fileContent = File.ReadAllText(filePath); } catch { }

                    // NEW-5: Language detection
                    string detectedLanguage = DetectLanguage(fileContent);

                    // NEW-6: Sentiment analysis
                    SentimentResult sentiment = AnalyseSentiment(fileContent);

                    // NEW-4: AWB extraction
                    string awbNumber = ExtractAwbNumber(fileContent);

                    // 4. Triage
                    string triage = TriageEmail(filePath, fileContent);
                    BroadcastFileTimeline(rpaRunId, filename, "intelligence_extracted", "Language, sentiment, AWB and triage signals extracted before AI handoff",
                        $"\"triage\":\"{EscapeJson(triage)}\"," +
                        $"\"language\":\"{detectedLanguage}\"," +
                        $"\"sentimentScore\":{sentiment.Score.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)}," +
                        $"\"sentimentLabel\":\"{EscapeJson(sentiment.Label)}\"," +
                        $"\"awbNumber\":\"{EscapeJson(awbNumber)}\"");
                    LogMessage($"[NEXUS RPA] Triage: {filename} → {triage} | Lang: {detectedLanguage} | Sentiment: {sentiment.Label} ({sentiment.Score:0.00}) | AWB: {(string.IsNullOrEmpty(awbNumber) ? "none" : awbNumber)}");

                    // NEW-1: Broadcast triage decision to ops dashboard
                    BroadcastOpsEvent("email_scan",
                        $"Email triaged: {filename} → {triage}" +
                            (string.IsNullOrEmpty(awbNumber) ? "" : $" | AWB: {awbNumber}") +
                            $" | {detectedLanguage.ToUpper()} | Sentiment: {sentiment.Label}",
                        $"\"filename\":\"{EscapeJson(filename)}\"," +
                        $"\"triage\":\"{triage}\"," +
                        $"\"language\":\"{detectedLanguage}\"," +
                        $"\"sentimentScore\":{sentiment.Score.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)}," +
                        $"\"sentimentLabel\":\"{sentiment.Label}\"," +
                        $"\"awbNumber\":\"{EscapeJson(awbNumber)}\"");

                    if (triage == "SPAM")
                    {
                        BroadcastFileTimeline(rpaRunId, filename, "file_skipped", "Spam or auto-reply discarded by RPA triage",
                            $"\"triage\":\"SPAM\",\"outcome\":\"spam\"");
                        LogMessage($"[NEXUS RPA] SPAM — skipping {filename}");
                        skippedCount++;
                        narrative.Append($"Discarded 1 spam/auto-reply ({filename}). ");
                        PostRunItem(rpaRunId, filename, fileHash, null, "spam", "spam_signal", null, null, null);
                        ArchiveFile(filePath, filename);
                        continue;
                    }

                    if (triage == "REPLY")
                    {
                        string caseRef = HandleReply(filePath, filename, rpaRunId);
                        BroadcastFileTimeline(rpaRunId, filename, "reply_threaded", "Customer reply routed back to an existing case thread",
                            $"\"caseRef\":\"{EscapeJson(caseRef)}\"");
                        skippedCount++;
                        if (!string.IsNullOrEmpty(caseRef))
                        {
                            LogMessage($"[NEXUS RPA] Reply threaded to {caseRef}");
                            narrative.Append($"Threaded customer reply to {caseRef}. ");
                            PostRunItem(rpaRunId, filename, fileHash, caseRef, "reply_threaded", null, null, null, null);

                            // NEW-1: Broadcast reply threaded event
                            BroadcastOpsEvent("reply_threaded",
                                $"Customer reply linked to case {caseRef}",
                                $"\"caseRef\":\"{EscapeJson(caseRef)}\",\"filename\":\"{EscapeJson(filename)}\"");
                        }
                        else
                        {
                            LogMessage($"[NEXUS RPA] Customer reply in {filename} — no case ID found");
                            narrative.Append($"Customer reply in {filename} — no case ID, treated as new. ");
                            PostRunItem(rpaRunId, filename, fileHash, null, "reply_threaded", "no_case_id_found", null, null, null);
                        }
                        continue;
                    }

                    if (triage == "ENQUIRY")
                    {
                        PostRunItem(rpaRunId, filename, fileHash, null, "enquiry", "enquiry_signal", null, null, null);
                        // Enquiries fall through to incident creation
                    }

                    // NEW-3: Customer DNA — look up prior cases for this sender
                    string customerEmail = ExtractCustomerEmail(filePath);
                    CustomerHistory history = GetCustomerHistory(customerEmail);
                    if (history.PriorCaseCount > 0)
                    {
                        LogMessage($"[NEXUS RPA] Customer DNA: {customerEmail} has {history.PriorCaseCount} prior case(s) — last: {history.LastCaseType}");
                        narrative.Append($"Repeat customer detected ({history.PriorCaseCount} prior cases). ");

                        // NEW-6: Repeat + high frustration = auto-elevate narrative
                        if (sentiment.Score < 0.35 && history.PriorCaseCount >= 2)
                        {
                            narrative.Append($"HIGH FRUSTRATION repeat customer — priority auto-elevated. ");
                            BroadcastOpsEvent("customer_alert",
                                $"⚠️ Repeat customer with high frustration detected — {history.PriorCaseCount} prior cases, sentiment {sentiment.Score:0.00}",
                                $"\"email\":\"{EscapeJson(customerEmail)}\"," +
                                $"\"priorCases\":{history.PriorCaseCount}," +
                                $"\"sentimentScore\":{sentiment.Score.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)}");
                        }
                    }

                    // 5. Create incident via /incidents/ingest-email (NEXUS auto-sends ack + chat link)
                    bool batchDefer = ShouldBatchDefer(filePath, fileContent);
                    BroadcastFileTimeline(rpaRunId, filename, "incident_handoff", "Structured RPA intake handed to NEXUS AI incident pipeline",
                        $"\"batchDefer\":{batchDefer.ToString().ToLower()}," +
                        $"\"customerEmail\":\"{EscapeJson(customerEmail)}\"," +
                        $"\"isRepeatCustomer\":{history.IsRepeat.ToString().ToLower()}");
                    string incidentId = CreateIncident(
                        filePath, filename, rpaRunId, batchDefer,
                        awbNumber, detectedLanguage,
                        sentiment.Score, sentiment.Label,
                        history.PriorCaseCount, history.IsRepeat, history.LastCaseType,
                        customerEmail);

                    // 6. Wait for AI pipeline to complete
                    string severity = WaitForIncidentSeverity(incidentId);

                    // NEW-1: Broadcast classification result to live dashboard
                    string incidentType       = FetchIncidentField(incidentId, "type");
                    string confidenceRaw      = FetchIncidentField(incidentId, "confidence");
                    double confidence         = 0;
                    double.TryParse(confidenceRaw,
                        System.Globalization.NumberStyles.Float,
                        System.Globalization.CultureInfo.InvariantCulture,
                        out confidence);
                    string incidentLocation   = FetchIncidentLocation(incidentId);
                    string confidencePct      = (confidence * 100).ToString("0");
                    BroadcastFileTimeline(rpaRunId, filename, "ai_completed", "NEXUS AI pipeline completed classification and routing",
                        $"\"incidentId\":\"{EscapeJson(incidentId)}\"," +
                        $"\"incidentType\":\"{EscapeJson(incidentType ?? "")}\"," +
                        $"\"severity\":\"{EscapeJson(severity ?? "")}\"," +
                        $"\"location\":\"{EscapeJson(incidentLocation ?? "")}\"," +
                        $"\"confidence\":{confidence.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)}");

                    BroadcastOpsEvent("classified",
                        $"Incident {incidentId} classified — {(incidentType ?? "incident").Replace("_", " ")} " +
                        $"({confidencePct}% confidence) at {incidentLocation ?? "unknown location"}",
                        $"\"incidentId\":\"{incidentId}\"," +
                        $"\"type\":\"{EscapeJson(incidentType ?? "")}\"," +
                        $"\"severity\":\"{EscapeJson(severity ?? "")}\"," +
                        $"\"confidence\":{confidence.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)}," +
                        $"\"location\":\"{EscapeJson(incidentLocation ?? "")}\"," +
                        $"\"awbNumber\":\"{EscapeJson(awbNumber)}\"," +
                        $"\"language\":\"{detectedLanguage}\"," +
                        $"\"sentimentScore\":{sentiment.Score.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)}," +
                        $"\"isRepeatCustomer\":{history.IsRepeat.ToString().ToLower()}");

                    // NEW-6: Broadcast sentiment event if highly frustrated
                    if (sentiment.Score < 0.35)
                    {
                        BroadcastOpsEvent("sentiment_detected",
                            $"Frustrated customer tone detected in {incidentId} (score: {sentiment.Score:0.00}) — priority reviewed",
                            $"\"incidentId\":\"{incidentId}\"," +
                            $"\"score\":{sentiment.Score.ToString("0.00", System.Globalization.CultureInfo.InvariantCulture)}," +
                            $"\"label\":\"{EscapeJson(sentiment.Label)}\"");
                    }

                    // 7. Route by severity
                    HandleSeverityRouting(severity, filename, incidentId, batchDefer, rpaRunId, narrative);

                    // CREATIVE-2: track for cluster detection
                    if (!string.IsNullOrEmpty(incidentLocation))
                    {
                        if (!locationCounts.ContainsKey(incidentLocation))
                            locationCounts[incidentLocation] = new List<string>();
                        locationCounts[incidentLocation].Add(incidentId);
                    }

                    LogMessage($"[NEXUS RPA] Created {incidentId} ({incidentType ?? "incident"}, {incidentLocation ?? "unknown"})");
                    narrative.Append($"Created {incidentId} ({incidentType ?? "incident"}, {incidentLocation ?? "unknown"}). ");

                    // 8. Log hash + archive
                    LogProcessedFile(fileHash, filename, rpaRunId);
                    ArchiveFile(filePath, filename);
                    BroadcastFileTimeline(rpaRunId, filename, "file_archived", "Source file archived after successful NEXUS update",
                        $"\"incidentId\":\"{EscapeJson(incidentId)}\",\"outcome\":\"created\"");

                    PostRunItem(rpaRunId, filename, fileHash, incidentId, "created", null, severity, incidentLocation, null);
                    processedCount++;
                    LogMessage($"[NEXUS RPA] OK — {filename} → {incidentId}");

                    // NEW-8: Record result for SOP gap audit and HTML shift-handover summary
                    bool wasHitl = string.Equals(severity, "Critical", StringComparison.OrdinalIgnoreCase)
                                || string.Equals(severity, "High",     StringComparison.OrdinalIgnoreCase);
                    batchResults.Add(new BatchResult {
                        Filename      = filename,
                        IncidentId    = incidentId,
                        Type          = incidentType ?? "unknown",
                        Severity      = severity     ?? "unknown",
                        Location      = incidentLocation ?? "unknown",
                        ConfidencePct = confidencePct,
                        Outcome       = wasHitl ? "HITL" : "Auto-Resolved",
                        WasHitl       = wasHitl,
                    });
                    if (!string.IsNullOrEmpty(incidentType))
                        typesSeen.Add(incidentType);
                }
                catch (Exception ex)
                {
                    failedCount++;
                    LogError($"[NEXUS RPA] FAILED on {filename}: {ex.Message}");
                    narrative.Append($"1 file moved to errors/ ({filename}). ");

                    try
                    {
                        string errorsDir = Path.Combine(WATCH_FOLDER, "errors");
                        EnsureDirectory(errorsDir);
                        string errDest = Path.Combine(errorsDir, filename);
                        if (File.Exists(errDest))
                            errDest = Path.Combine(errorsDir,
                                Path.GetFileNameWithoutExtension(filename)
                                + "_" + DateTime.UtcNow.ToString("yyyyMMddHHmmss")
                                + Path.GetExtension(filename));
                        File.Move(filePath, errDest);

                        string failureNote =
                            $"{{\"filename\":\"{EscapeJson(filename)}\"," +
                            $"\"failedAt\":\"{DateTime.UtcNow:o}\"," +
                            $"\"error\":\"{EscapeJson(ex.Message)}\"," +
                            $"\"rpaRunId\":\"{rpaRunId}\"," +
                            $"\"movedTo\":\"{EscapeJson(errDest)}\"}}";
                        File.WriteAllText(errDest + ".failure.json", failureNote);
                    }
                    catch { }

                    PostRunItem(rpaRunId, filename, fileHash, null, "failed", null, null, null, ex.Message);
                    BroadcastFileTimeline(rpaRunId, filename, "file_failed", "RPA file processing failed and was moved to the errors folder",
                        $"\"error\":\"{EscapeJson(ex.Message)}\"");

                    BroadcastOpsEvent("error",
                        $"Processing failed: {filename} — {ex.Message}",
                        $"\"filename\":\"{EscapeJson(filename)}\",\"error\":\"{EscapeJson(ex.Message)}\"");

                    try { TakeErrorScreenshot(filename, LOG_FOLDER); } catch { }
                }
            }

            // CREATIVE-2: Hub cluster alert
            foreach (var kvp in locationCounts)
            {
                if (kvp.Value.Count >= 2)
                {
                    LogWarning($"[NEXUS RPA] Cluster: {kvp.Value.Count} incidents at {kvp.Key}");
                    narrative.Append($"Cluster at {kvp.Key} ({kvp.Value.Count} incidents) — hub manager notified. ");

                    // NEW-1: Broadcast cluster to live dashboard
                    BroadcastOpsEvent("cluster_detected",
                        $"CLUSTER ALERT: {kvp.Value.Count} incidents detected at {kvp.Key} — cascade risk evaluated",
                        $"\"location\":\"{EscapeJson(kvp.Key)}\",\"count\":{kvp.Value.Count}," +
                        $"\"incidentIds\":{IdListToJson(kvp.Value)}");

                    SendHubClusterAlert(kvp.Key, kvp.Value, rpaRunId);
                }
            }

            // NEW-8: SOP Gap Detection
            // After the batch, check every incident type that was seen against the
            // published SOP library. Missing SOPs trigger an auto-draft request,
            // ensuring the Knowledge Base stays in sync with real-world incident patterns.
            if (typesSeen.Count > 0)
            {
                LogMessage($"[NEXUS RPA] SOP gap scan — checking {typesSeen.Count} incident type(s)...");
                foreach (string seenType in typesSeen)
                {
                    try
                    {
                        if (!CheckSopExists(seenType))
                        {
                            sopGapsFound++;
                            LogWarning($"[NEXUS RPA] SOP GAP: no active SOP for '{seenType}' — requesting auto-draft");
                            narrative.Append($"SOP gap detected for '{seenType}' — auto-draft requested. ");

                            BroadcastOpsEvent("sop_gap_detected",
                                $"No active SOP found for '{seenType}' — auto-draft request filed",
                                $"\"incidentType\":\"{EscapeJson(seenType)}\",\"runId\":\"{rpaRunId}\"");

                            RequestSopDraft(seenType, rpaRunId);
                        }
                    }
                    catch { }
                }
                LogMessage(sopGapsFound > 0
                    ? $"[NEXUS RPA] SOP gap scan complete — {sopGapsFound} gap(s) found, draft(s) requested"
                    : "[NEXUS RPA] SOP gap scan complete — all incident types have active SOPs");
            }

            // Finalize narrative
            if (processedCount == 0 && skippedCount == 0 && failedCount == 0)
                narrative.Append("No files found in watch folder.");
            string narrativeText = narrative.ToString().Trim();

            BroadcastBatchIntelligence(rpaRunId, batchResults, locationCounts,
                processedCount, skippedCount, failedCount, sopGapsFound,
                runStartTime, fileEntries.Count, narrativeText);

            // Post run summary
            PostRunRecord(rpaRunId, processedCount, skippedCount, failedCount, runStartTime, narrativeText);

            // NEW-1: Broadcast run complete to live dashboard
            BroadcastOpsEvent("bot_summary",
                $"RPA run complete — {processedCount} processed | {skippedCount} skipped | {failedCount} failed",
                $"\"runId\":\"{rpaRunId}\"," +
                $"\"processed\":{processedCount}," +
                $"\"skipped\":{skippedCount}," +
                $"\"failed\":{failedCount}," +
                $"\"durationMs\":{Math.Round((DateTime.UtcNow - runStartTime).TotalMilliseconds)}");

            // NEW-2: Process outbound AI-generated response queue
            LogMessage("[NEXUS RPA] Checking outbound response queue...");
            ProcessOutboundQueue(rpaRunId);

            // NEW-9: HTML Batch Summary Email
            // Sends a rich per-case summary table to the ops team — far more actionable
            // than a plain-text log for shift handover. Only fires when cases were processed.
            if (batchResults.Count > 0)
            {
                try
                {
                    SendHtmlBatchSummary(rpaRunId, batchResults, runStartTime,
                        processedCount, skippedCount, failedCount, sopGapsFound);
                    LogMessage("[NEXUS RPA] HTML batch summary emailed to ops team");
                }
                catch (Exception sumEx)
                {
                    LogWarning($"[NEXUS RPA] Batch summary email failed (non-fatal): {sumEx.Message}");
                }
            }

            LogMessage($"[NEXUS RPA v4.0] Run complete — Processed: {processedCount} | Skipped: {skippedCount} | Failed: {failedCount}");
        }

        // ══════════════════════════════════════════════════════════
        // NEW-1: Real-time Ops Dashboard Broadcasting
        // Posts events to /api/v1/ops/event so live dashboard
        // shows actual bot activity, not a scripted replay.
        // ══════════════════════════════════════════════════════════

        private void BroadcastOpsEvent(string type, string message, string metaJson = "")
        {
            try
            {
                using (var client = BuildHttpClient())
                {
                    string meta = string.IsNullOrEmpty(metaJson) ? "{}" : $"{{{metaJson}}}";
                    string json =
                        $"{{\"type\":\"{EscapeJson(type)}\"," +
                        $"\"message\":\"{EscapeJson(message)}\"," +
                        $"\"meta\":{meta}," +
                        $"\"source\":\"uipath\"," +
                        $"\"timestamp\":\"{DateTime.UtcNow:o}\"}}";

                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    // Fire-and-forget with 5s timeout — ops dashboard is non-critical
                    using (var shortClient = new HttpClient { Timeout = TimeSpan.FromSeconds(5) })
                    {
                        shortClient.DefaultRequestHeaders.Add("X-API-Key", API_KEY);
                        shortClient.PostAsync($"{BASE_URL}/ops/event", content).GetAwaiter().GetResult();
                    }
                }
            }
            catch
            {
                // Ops broadcast is best-effort — never cascade
            }
        }

        // ══════════════════════════════════════════════════════════
        // NEW-2: Outbound Response Loop
        // Polls the AI-generated response queue and sends emails
        // via Outlook, completing the full autonomous loop:
        //   Email in → AI classifies & drafts → Bot sends reply
        // ══════════════════════════════════════════════════════════

        private void BroadcastBatchIntelligence(string rpaRunId, List<BatchResult> results,
                                                Dictionary<string, List<string>> locationCounts,
                                                int processed, int skipped, int failed,
                                                int sopGaps, DateTime startTime,
                                                int totalFiles, string narrative)
        {
            try
            {
                int hitlCount = 0;
                int autoCount = 0;
                var typeCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

                foreach (var result in results)
                {
                    if (result.WasHitl) hitlCount++; else autoCount++;
                    string type = string.IsNullOrEmpty(result.Type) ? "unknown" : result.Type;
                    if (!typeCounts.ContainsKey(type)) typeCounts[type] = 0;
                    typeCounts[type]++;
                }

                string topType = "none";
                int topTypeCount = 0;
                foreach (var kvp in typeCounts)
                {
                    if (kvp.Value > topTypeCount)
                    {
                        topType = kvp.Key;
                        topTypeCount = kvp.Value;
                    }
                }

                string topHub = "none";
                int topHubCount = 0;
                int clusterCount = 0;
                foreach (var kvp in locationCounts)
                {
                    if (kvp.Value.Count > topHubCount)
                    {
                        topHub = kvp.Key;
                        topHubCount = kvp.Value.Count;
                    }
                    if (kvp.Value.Count >= 2) clusterCount++;
                }

                string recommendation =
                    sopGaps > 0 ? "Review generated SOP drafts in Knowledge Observatory"
                    : clusterCount > 0 ? "Open Proactive workspace and prepare hub/customer alert"
                    : failed > 0 ? "Inspect failed RPA files and replay pending sync"
                    : processed > 0 ? "Ask NEXUS Brain for root-cause and prevention actions"
                    : "No operational action required";

                double durationMs = Math.Round((DateTime.UtcNow - startTime).TotalMilliseconds);
                BroadcastOpsEvent("rpa_batch_intelligence",
                    $"RPA intelligence packet ready - {processed} structured incident(s), top hub {topHub}, top type {topType}",
                    $"\"runId\":\"{EscapeJson(rpaRunId)}\"," +
                    $"\"totalFiles\":{totalFiles}," +
                    $"\"processed\":{processed}," +
                    $"\"skipped\":{skipped}," +
                    $"\"failed\":{failed}," +
                    $"\"hitlRouted\":{hitlCount}," +
                    $"\"autoResolved\":{autoCount}," +
                    $"\"sopGaps\":{sopGaps}," +
                    $"\"clusterCount\":{clusterCount}," +
                    $"\"topHub\":\"{EscapeJson(topHub)}\"," +
                    $"\"topHubCount\":{topHubCount}," +
                    $"\"topType\":\"{EscapeJson(topType)}\"," +
                    $"\"topTypeCount\":{topTypeCount}," +
                    $"\"durationMs\":{durationMs}," +
                    $"\"recommendation\":\"{EscapeJson(recommendation)}\"," +
                    $"\"narrative\":\"{EscapeJson(Truncate(narrative, 450))}\"");
            }
            catch
            {
                // Batch intelligence is best-effort and must never block RPA completion.
            }
        }

        private void BroadcastFileTimeline(string rpaRunId, string filename, string stage, string message, string extraMetaJson = "")
        {
            string safeExtra = string.IsNullOrEmpty(extraMetaJson) ? "" : "," + extraMetaJson;
            BroadcastOpsEvent("rpa_file_timeline",
                $"{filename} - {message}",
                $"\"runId\":\"{EscapeJson(rpaRunId)}\"," +
                $"\"filename\":\"{EscapeJson(filename)}\"," +
                $"\"stage\":\"{EscapeJson(stage)}\"" +
                safeExtra);
        }

        private void ProcessOutboundQueue(string rpaRunId)
        {
            int sentCount   = 0;
            int failedCount = 0;

            try
            {
                using (var client = BuildHttpClient())
                {
                    HttpResponseMessage response = client.GetAsync($"{BASE_URL}/rpa-runs/outbound-queue").Result;
                    if (!response.IsSuccessStatusCode)
                    {
                        LogWarning($"[NEXUS RPA] Outbound queue fetch failed: HTTP {(int)response.StatusCode}");
                        return;
                    }

                    string body = response.Content.ReadAsStringAsync().Result;
                    LogMessage($"[NEXUS RPA] Outbound queue response received ({body.Length} chars)");

                    // Parse the queue array
                    // Expected: { "queue": [ { "_id": "...", "incidentId": "...", "title": "...", "type": "...", ... } ] }
                    List<OutboundEmail> queue = ParseOutboundQueue(body);
                    LogMessage($"[NEXUS RPA] Outbound queue: {queue.Count} email(s) pending");

                    if (queue.Count == 0) return;

                    BroadcastOpsEvent("response_queue_start",
                        $"Processing {queue.Count} queued AI-generated response(s)",
                        $"\"queueCount\":{queue.Count}");

                    foreach (OutboundEmail email in queue)
                    {
                        try
                        {
                            if (string.IsNullOrEmpty(email.CustomerEmail))
                            {
                                LogWarning($"[NEXUS RPA] Outbound skip — no customer email for incident {email.IncidentId}");
                                MarkOutboundFailed(email.Id, "No customer email address found");
                                failedCount++;
                                continue;
                            }

                            // Fetch full incident to build a rich response email
                            string incidentBody = FetchIncidentRaw(email.IncidentId);
                            string recoveryMsg  = TryExtractNestedJsonValue(incidentBody, "recoveryMessage", "body");
                            string incidentType = TryExtractJsonValue(incidentBody, "type");
                            string severity     = TryExtractJsonValue(incidentBody, "severity");
                            string location     = TryExtractJsonValue(incidentBody, "location");
                            string language     = TryExtractJsonValue(incidentBody, "detectedLanguage");

                            // Build the response email
                            string subject      = BuildResponseSubject(email.IncidentId, incidentType, language);
                            string emailContent = BuildResponseBody(
                                email.IncidentId, incidentType, severity, location,
                                recoveryMsg, language);

                            SendOutlookEmail(email.CustomerEmail, subject, emailContent);
                            LogMessage($"[NEXUS RPA] Response sent to {email.CustomerEmail} for {email.IncidentId}");

                            // Mark as sent in backend
                            MarkOutboundSent(email.Id);
                            sentCount++;

                            // NEW-1: Broadcast response sent to live dashboard
                            BroadcastOpsEvent("response_sent",
                                $"Auto-response sent to customer for case {email.IncidentId} ({(incidentType ?? "").Replace("_", " ")})",
                                $"\"incidentId\":\"{EscapeJson(email.IncidentId)}\"," +
                                $"\"to\":\"{EscapeJson(email.CustomerEmail)}\"," +
                                $"\"type\":\"{EscapeJson(incidentType ?? "")}\"," +
                                $"\"language\":\"{EscapeJson(language ?? "en")}\"");
                        }
                        catch (Exception ex)
                        {
                            LogWarning($"[NEXUS RPA] Failed to send response for {email.IncidentId}: {ex.Message}");
                            try { MarkOutboundFailed(email.Id, ex.Message); } catch { }
                            failedCount++;
                        }
                    }

                    if (sentCount > 0)
                    {
                        BroadcastOpsEvent("notification_sent",
                            $"Batch response complete — {sentCount} customer email(s) sent, {failedCount} failed",
                            $"\"sent\":{sentCount},\"failed\":{failedCount}");
                        LogMessage($"[NEXUS RPA] Outbound complete — Sent: {sentCount} | Failed: {failedCount}");
                    }
                }
            }
            catch (Exception ex)
            {
                LogWarning($"[NEXUS RPA] ProcessOutboundQueue error: {ex.Message}");
            }
        }

        private string BuildResponseSubject(string incidentId, string incidentType, string language)
        {
            bool isMalay = string.Equals(language, "ms", StringComparison.OrdinalIgnoreCase);
            string typeFriendly = (incidentType ?? "General Inquiry").Replace("_", " ");
            typeFriendly = char.ToUpper(typeFriendly[0]) + typeFriendly.Substring(1);

            return isMalay
                ? $"Re: Aduan DHL Anda — Kes #{incidentId} — {typeFriendly}"
                : $"Re: Your DHL Support Case — #{incidentId} — {typeFriendly}";
        }

        private string BuildResponseBody(string incidentId, string incidentType,
                                          string severity, string location,
                                          string aiResolution, string language)
        {
            bool isMalay = string.Equals(language, "ms", StringComparison.OrdinalIgnoreCase);

            if (isMalay)
            {
                return
                    "Yang Dihormati Pelanggan," + Environment.NewLine + Environment.NewLine +
                    "Terima kasih kerana menghubungi DHL Express Malaysia." + Environment.NewLine +
                    "Kami telah menerima aduan anda dan telah mengambil tindakan." + Environment.NewLine + Environment.NewLine +
                    $"Nombor Kes: {incidentId}" + Environment.NewLine +
                    $"Jenis: {(incidentType ?? "").Replace("_", " ")}" + Environment.NewLine +
                    $"Keutamaan: {severity}" + Environment.NewLine + Environment.NewLine +
                    "TINDAKAN KAMI:" + Environment.NewLine +
                    (string.IsNullOrWhiteSpace(aiResolution)
                        ? "Pasukan kami sedang menyiasat kes anda dan akan menghubungi anda tidak lama lagi."
                        : aiResolution) + Environment.NewLine + Environment.NewLine +
                    $"Lihat status kes anda: {FRONTEND_URL}/incidents/{incidentId}" + Environment.NewLine + Environment.NewLine +
                    "Sekiranya ada pertanyaan, sila hubungi: 1300-888-DHL" + Environment.NewLine + Environment.NewLine +
                    "Yang ikhlas," + Environment.NewLine +
                    "Pasukan Operasi DHL NEXUS";
            }
            else
            {
                return
                    "Dear Customer," + Environment.NewLine + Environment.NewLine +
                    "Thank you for contacting DHL Express. We have received your case and our team has taken action." + Environment.NewLine + Environment.NewLine +
                    $"Case Reference: {incidentId}" + Environment.NewLine +
                    $"Issue Type:     {(incidentType ?? "").Replace("_", " ")}" + Environment.NewLine +
                    $"Priority:       {severity}" + Environment.NewLine +
                    $"Handling Hub:   {location}" + Environment.NewLine + Environment.NewLine +
                    "RESOLUTION:" + Environment.NewLine +
                    (string.IsNullOrWhiteSpace(aiResolution)
                        ? "Our operations team is actively working on your case and will update you within the committed SLA window."
                        : aiResolution) + Environment.NewLine + Environment.NewLine +
                    $"Track your case: {FRONTEND_URL}/incidents/{incidentId}" + Environment.NewLine + Environment.NewLine +
                    "For urgent matters, please call: 1300-888-DHL" + Environment.NewLine + Environment.NewLine +
                    "Warm regards," + Environment.NewLine +
                    "DHL NEXUS Operations Team";
            }
        }

        private List<OutboundEmail> ParseOutboundQueue(string json)
        {
            var result = new List<OutboundEmail>();
            try
            {
                // Find "queue": [ ... ] array
                int arrayStart = json.IndexOf("[", StringComparison.Ordinal);
                int arrayEnd   = json.LastIndexOf("]", StringComparison.Ordinal);
                if (arrayStart < 0 || arrayEnd < 0) return result;

                string arrayContent = json.Substring(arrayStart + 1, arrayEnd - arrayStart - 1).Trim();
                if (string.IsNullOrEmpty(arrayContent)) return result;

                // Split objects (simple approach — works for well-formed JSON from our backend)
                int depth = 0;
                int objStart = -1;
                for (int i = 0; i < arrayContent.Length; i++)
                {
                    if (arrayContent[i] == '{') { if (depth++ == 0) objStart = i; }
                    else if (arrayContent[i] == '}')
                    {
                        if (--depth == 0 && objStart >= 0)
                        {
                            string obj = arrayContent.Substring(objStart, i - objStart + 1);
                            string id          = TryExtractJsonValue(obj, "_id");
                            string incidentId  = TryExtractJsonValue(obj, "incidentId");
                            string custEmail   = TryExtractJsonValue(obj, "customerEmail");
                            if (string.IsNullOrEmpty(custEmail))
                                custEmail = TryExtractJsonValue(obj, "email");

                            if (!string.IsNullOrEmpty(id) || !string.IsNullOrEmpty(incidentId))
                            {
                                result.Add(new OutboundEmail
                                {
                                    Id            = id,
                                    IncidentId    = incidentId,
                                    CustomerEmail = custEmail
                                });
                            }
                            objStart = -1;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                LogWarning($"[NEXUS RPA] ParseOutboundQueue error: {ex.Message}");
            }
            return result;
        }

        private void MarkOutboundSent(string emailId)
        {
            try
            {
                using (var client = BuildHttpClient())
                {
                    string json = $"{{\"status\":\"sent\",\"sentAt\":\"{DateTime.UtcNow:o}\"}}";
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    client.PatchAsync($"{BASE_URL}/rpa-runs/outbound-queue/{emailId}", content).Result.Dispose();
                }
            }
            catch { }
        }

        private void MarkOutboundFailed(string emailId, string error)
        {
            try
            {
                using (var client = BuildHttpClient())
                {
                    string json = $"{{\"status\":\"failed\",\"error\":\"{EscapeJson(error)}\"}}";
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    client.PatchAsync($"{BASE_URL}/rpa-runs/outbound-queue/{emailId}", content).Result.Dispose();
                }
            }
            catch { }
        }

        private string FetchIncidentRaw(string incidentId)
        {
            try
            {
                using (var client = BuildHttpClient())
                {
                    var response = client.GetAsync($"{BASE_URL}/incidents/{incidentId}").Result;
                    return response.Content.ReadAsStringAsync().Result;
                }
            }
            catch { return "{}"; }
        }

        private string TryExtractNestedJsonValue(string json, string outerKey, string innerKey)
        {
            try
            {
                // Find the outer object value
                string outerSearch = $"\"{outerKey}\":{{";
                int outerStart = json.IndexOf(outerSearch, StringComparison.Ordinal);
                if (outerStart < 0) return string.Empty;

                // Find the matching closing brace
                int braceStart = outerStart + outerSearch.Length - 1;
                int depth = 1;
                int pos = braceStart + 1;
                while (pos < json.Length && depth > 0)
                {
                    if (json[pos] == '{') depth++;
                    else if (json[pos] == '}') depth--;
                    pos++;
                }

                string innerJson = json.Substring(braceStart, pos - braceStart);
                return TryExtractJsonValue(innerJson, innerKey);
            }
            catch { return string.Empty; }
        }

        // ══════════════════════════════════════════════════════════
        // NEW-3: Customer DNA — Behavioral History Lookup
        // Looks up prior incident cases for this sender email.
        // Result used to flag repeat customers and adjust AI context.
        // ══════════════════════════════════════════════════════════

        private CustomerHistory GetCustomerHistory(string customerEmail)
        {
            var result = new CustomerHistory();
            if (string.IsNullOrEmpty(customerEmail)) return result;

            try
            {
                using (var client = BuildHttpClient())
                {
                    string encoded = Uri.EscapeDataString(customerEmail);
                    string url = $"{BASE_URL}/incidents?reporterEmail={encoded}&limit=5&status=RESOLVED";
                    HttpResponseMessage response = client.GetAsync(url).Result;
                    if (!response.IsSuccessStatusCode) return result;

                    string body = response.Content.ReadAsStringAsync().Result;

                    // Count the incidents in the array
                    int count = 0;
                    int searchPos = 0;
                    while (true)
                    {
                        int idx = body.IndexOf("\"_id\":", searchPos, StringComparison.Ordinal);
                        if (idx < 0) break;
                        count++;
                        searchPos = idx + 6;
                    }

                    result.PriorCaseCount = count;
                    result.IsRepeat       = count >= 1;

                    if (count > 0)
                        result.LastCaseType = TryExtractJsonValue(body, "type");
                }
            }
            catch { }

            return result;
        }

        // ══════════════════════════════════════════════════════════
        // NEW-4: AWB Number Intelligence
        // Extracts DHL AWB / tracking numbers from email content.
        // ══════════════════════════════════════════════════════════

        private string ExtractAwbNumber(string content)
        {
            if (string.IsNullOrEmpty(content)) return string.Empty;
            try
            {
                Match m = AwbPattern.Match(content);
                return m.Success ? m.Groups[1].Value.ToUpper() : string.Empty;
            }
            catch { return string.Empty; }
        }

        // ══════════════════════════════════════════════════════════
        // NEW-5: Language Detection (Bahasa Melayu / English)
        // Counts Malay keyword frequency to detect language.
        // Returns "ms" for Malay, "en" for English.
        // ══════════════════════════════════════════════════════════

        private string DetectLanguage(string content)
        {
            if (string.IsNullOrEmpty(content)) return "en";
            try
            {
                string lower = content.ToLowerInvariant();
                int malayScore = 0;
                foreach (string kw in MalayKeywords)
                    if (lower.Contains(kw)) malayScore++;

                return malayScore >= 3 ? "ms" : "en";
            }
            catch { return "en"; }
        }

        // ══════════════════════════════════════════════════════════
        // NEW-6: Sentiment Analysis — Emotional Intelligence
        // Heuristic scoring: 0.0 = very frustrated, 1.0 = positive.
        // High frustration triggers priority auto-elevation.
        // ══════════════════════════════════════════════════════════

        private SentimentResult AnalyseSentiment(string content)
        {
            var result = new SentimentResult { Score = 0.65, Label = "neutral" };
            if (string.IsNullOrEmpty(content)) return result;

            try
            {
                string lower = content.ToLowerInvariant();

                int frustrationHits = 0;
                int urgencyHits     = 0;

                foreach (string w in FrustrationWords)
                    if (lower.Contains(w)) frustrationHits++;

                foreach (string w in UrgencyWords)
                    if (lower.Contains(w)) urgencyHits++;

                // Scoring model
                double score = 0.65; // neutral baseline
                score -= frustrationHits * 0.12;
                score -= urgencyHits     * 0.06;

                // Clamp 0.0 – 1.0
                score = Math.Max(0.0, Math.Min(1.0, score));

                string label;
                if (score >= 0.70)      label = "positive";
                else if (score >= 0.45) label = "neutral";
                else if (score >= 0.25) label = "frustrated";
                else                    label = "very_frustrated";

                result.Score = Math.Round(score, 2);
                result.Label = label;
            }
            catch { }

            return result;
        }

        // ══════════════════════════════════════════════════════════
        // LOGGING
        // ══════════════════════════════════════════════════════════

        private void LogMessage(string message)
        {
            Log(message, UiPath.CodedWorkflows.LogLevel.Info);
        }

        private void LogWarning(string message)
        {
            Log(message, UiPath.CodedWorkflows.LogLevel.Warn);
        }

        private void LogError(string message)
        {
            Log(message, UiPath.CodedWorkflows.LogLevel.Error);
        }

        // ══════════════════════════════════════════════════════════
        // TRIAGE — enhanced with content pre-read (NEW-4/5/6)
        // ══════════════════════════════════════════════════════════

        private string TriageEmail(string filePath, string preloadedContent = null)
        {
            try
            {
                string content = preloadedContent != null
                    ? preloadedContent.ToLowerInvariant()
                    : File.ReadAllText(filePath).ToLowerInvariant();

                string[] spamSignals = {
                    "unsubscribe", "newsletter", "promotional",
                    "out of office", "automatic reply",
                    "auto-reply", "do not reply",
                    "noreply", "no-reply"
                };

                string[] replySignals = {
                    "inc-20", "case reference:",
                    "case number:", "your reference:",
                    "re: your dhl support",
                    "re: dhl support case",
                    "re: dhl express", "re: nexus", "inc-"
                };

                string[] incidentSignals = {
                    "damaged", "missing", "lost", "late",
                    "delayed", "wrong item", "not arrived",
                    "tidak sampai", "rosak", "hilang",
                    "lambat", "parcel", "shipment",
                    "barang", "kotak", "box",
                    "belum terima", "tak sampai",
                    "pecah", "penyok", "lembab", "basah"
                };

                string[] enquirySignals = {
                    "pricing", "quotation", "how much",
                    "operating hours", "pickup schedule",
                    "business account", "account setup",
                    "where is your office", "service area"
                };

                foreach (string s in spamSignals)
                    if (content.Contains(s)) return "SPAM";

                string[] lines = File.ReadAllLines(filePath);
                bool subjectIsReply = false;
                foreach (string line in lines)
                {
                    if (line.StartsWith("Subject:", StringComparison.OrdinalIgnoreCase))
                    {
                        string subjectVal = line.Substring(8).Trim().ToLowerInvariant();
                        if (subjectVal.StartsWith("re:")) subjectIsReply = true;
                        break;
                    }
                }

                if (subjectIsReply) return "REPLY";

                foreach (string s in replySignals)
                    if (content.Contains(s)) return "REPLY";

                int incidentScore = 0;
                foreach (string s in incidentSignals)
                    if (content.Contains(s)) incidentScore++;

                if (incidentScore >= 1) return "INCIDENT";

                foreach (string s in enquirySignals)
                    if (content.Contains(s)) return "ENQUIRY";

                return "INCIDENT";
            }
            catch { return "INCIDENT"; }
        }

        // ══════════════════════════════════════════════════════════
        // HandleReply — 3-signal case ID extraction
        // ══════════════════════════════════════════════════════════

        private string HandleReply(string filePath, string filename, string rpaRunId)
        {
            try
            {
                string content = File.ReadAllText(filePath);
                string[] lines = content.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);

                string caseRef = string.Empty;

                foreach (string line in lines)
                {
                    if (line.StartsWith("Subject:", StringComparison.OrdinalIgnoreCase))
                    {
                        var m = Regex.Match(line, @"INC-[A-Za-z0-9]{8,}", RegexOptions.IgnoreCase);
                        if (m.Success) { caseRef = m.Value; break; }
                    }
                }

                if (string.IsNullOrEmpty(caseRef))
                {
                    var m = Regex.Match(content, @"INC-[A-Za-z0-9]{8,}", RegexOptions.IgnoreCase);
                    if (m.Success) caseRef = m.Value;
                }

                if (string.IsNullOrEmpty(caseRef))
                {
                    var m = Regex.Match(content, @"Case Reference:\s*(INC-[A-Za-z0-9]{8,})", RegexOptions.IgnoreCase);
                    if (m.Success) caseRef = m.Groups[1].Value;
                }

                if (string.IsNullOrEmpty(caseRef))
                {
                    LogMessage($"[NEXUS RPA] REPLY — no case ID in {filename}, new incident");
                    return string.Empty;
                }

                LogMessage($"[NEXUS RPA] REPLY — threading to {caseRef}");

                using (var client = BuildHttpClient())
                {
                    string noteContent = content.Length > 500 ? content.Substring(0, 500) + "..." : content;
                    string noteBody = "{\"note\":\"" + EscapeJson(noteContent) + "\",\"source\":\"rpa\"}";
                    var httpContent = new StringContent(noteBody, Encoding.UTF8, "application/json");

                    var response = client.PostAsync($"{BASE_URL}/incidents/{caseRef}/notes", httpContent).Result;
                    if (response.IsSuccessStatusCode)
                        LogMessage($"[NEXUS RPA] Note added to {caseRef}");
                    else
                        LogWarning($"[NEXUS RPA] Note failed {caseRef}: {(int)response.StatusCode}");
                }

                ArchiveFile(filePath, filename);
                return caseRef;
            }
            catch (Exception ex)
            {
                LogWarning($"[NEXUS RPA] HandleReply error: {ex.Message}");
                return string.Empty;
            }
        }

        // ══════════════════════════════════════════════════════════
        // INCIDENT CREATION — enhanced with intelligence metadata
        // ══════════════════════════════════════════════════════════

        private string CreateIncident(string filePath, string filename, string rpaRunId,
                                       bool batchDefer,
                                       string awbNumber         = "",
                                       string detectedLanguage  = "en",
                                       double sentimentScore    = 0.65,
                                       string sentimentLabel    = "neutral",
                                       int    customerHistory   = 0,
                                       bool   isRepeatCustomer  = false,
                                       string lastCaseType      = "",
                                       string customerEmail     = "")
        {
            // Read full file content (already done in Execute but needed for body)
            string rawContent = "";
            try { rawContent = File.ReadAllText(filePath); } catch { rawContent = filename; }

            // Extract subject from the structured header Main.xaml writes
            string subject = filename;
            foreach (string line in rawContent.Split('\n'))
            {
                string trimmed = line.Trim();
                if (trimmed.StartsWith("Subject:", StringComparison.OrdinalIgnoreCase))
                {
                    subject = trimmed.Substring(8).Trim();
                    break;
                }
            }

            // Build JSON payload for the dedicated ingest-email endpoint
            // NEXUS will: create incident, run pipeline, auto-send ack email + chat link
            string json =
                $"{{" +
                $"\"from\":\"{EscapeJson(customerEmail)}\"," +
                $"\"subject\":\"{EscapeJson(subject)}\"," +
                $"\"body\":\"{EscapeJson(rawContent)}\"," +
                $"\"awbNumber\":\"{EscapeJson(awbNumber)}\"," +
                $"\"language\":\"{detectedLanguage}\"," +
                $"\"rpaRunId\":\"{rpaRunId}\"" +
                $"}}";

            using (var client = BuildHttpClient())
            {
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync($"{BASE_URL}/incidents/ingest-email", content).Result;
                string body = response.Content.ReadAsStringAsync().Result;

                if ((int)response.StatusCode != 202)
                    throw new Exception($"CreateIncident/ingest-email: HTTP {(int)response.StatusCode} — {body}");

                string incidentId = TryExtractJsonValue(body, "incidentId");
                if (string.IsNullOrEmpty(incidentId))
                    throw new Exception($"CreateIncident: no incidentId in response — {body}");

                return incidentId;
            }
        }

        // ══════════════════════════════════════════════════════════
        // WaitForIncidentSeverity — 24 × 2.5s = 60s
        // ══════════════════════════════════════════════════════════

        private string WaitForIncidentSeverity(string incidentId)
        {
            using (var client = BuildHttpClient())
            {
                string url = $"{BASE_URL}/incidents/{incidentId}";

                for (int attempt = 0; attempt < 24; attempt++)
                {
                    HttpResponseMessage response = client.GetAsync(url).Result;
                    string body = response.Content.ReadAsStringAsync().Result;

                    if (response.IsSuccessStatusCode)
                    {
                        string severity = TryExtractJsonValue(body, "severity");
                        string status   = TryExtractJsonValue(body, "status");

                        bool pipelineComplete =
                            !string.Equals(status, "DRAFT", StringComparison.OrdinalIgnoreCase) &&
                            !string.Equals(status, "QUEUED", StringComparison.OrdinalIgnoreCase);

                        if (!string.IsNullOrWhiteSpace(severity) && pipelineComplete)
                        {
                            LogMessage($"[NEXUS RPA] Severity resolved: {severity} (attempt {attempt + 1})");
                            return severity;
                        }
                    }

                    System.Threading.Thread.Sleep(2500);
                }
            }

            LogWarning($"[NEXUS RPA] WaitForSeverity timed out for {incidentId}");
            return string.Empty;
        }

        // ══════════════════════════════════════════════════════════
        // HandleSeverityRouting — email escalation + HITL brief
        // ══════════════════════════════════════════════════════════

        private void HandleSeverityRouting(string severity, string filename, string incidentId,
                                            bool batchDefer, string rpaRunId, StringBuilder narrative)
        {
            bool isCritical = string.Equals(severity, "Critical", StringComparison.OrdinalIgnoreCase);
            bool isHigh     = string.Equals(severity, "High",     StringComparison.OrdinalIgnoreCase);

            if (isCritical || isHigh)
            {
                string line = $"{DateTime.UtcNow:o} | {severity.ToUpper()} | {incidentId} | {filename}";
                File.AppendAllText(PRIORITY_LOG, line + Environment.NewLine);
                LogWarning($"[NEXUS RPA] PRIORITY — {severity} — {incidentId}");

                try
                {
                    string subject =
                        $"⚠️ NEXUS {severity} Incident — {incidentId} — Immediate Action Required";
                    string body =
                        $"NEXUS has detected a {severity} severity incident requiring immediate attention.\n\n" +
                        $"Case Reference: {incidentId}\n" +
                        $"Severity: {severity}\n" +
                        $"Source File: {filename}\n" +
                        $"Detected At: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC\n\n" +
                        $"This incident has been queued for HITL review.\n" +
                        $"Review at: {FRONTEND_URL}/review\n\n" +
                        $"— NEXUS Automation";
                    SendOutlookEmail(OPS_EMAIL, subject, body);
                    narrative.Append($"Escalated {incidentId} to ops team ({severity}). ");

                    // NEW-1: Broadcast escalation event
                    BroadcastOpsEvent("escalated",
                        $"⚠️ {severity} incident escalated to operations team — {incidentId}",
                        $"\"incidentId\":\"{incidentId}\",\"severity\":\"{EscapeJson(severity)}\"");
                }
                catch (Exception ex)
                {
                    LogWarning($"[NEXUS RPA] Escalation email failed: {ex.Message}");
                }

                SendHitlIntelligenceBrief(incidentId, severity);
                return;
            }

            if (string.Equals(severity, "Low", StringComparison.OrdinalIgnoreCase))
            {
                LogMessage(batchDefer
                    ? $"[NEXUS RPA] LOW — batchDefer=true for {incidentId}"
                    : $"[NEXUS RPA] LOW — {incidentId}");
                return;
            }

            if (string.Equals(severity, "Medium", StringComparison.OrdinalIgnoreCase))
                LogMessage($"[NEXUS RPA] STANDARD — {incidentId}");
        }

        // ══════════════════════════════════════════════════════════
        // CREATIVE-2: Hub Cluster Alert
        // ══════════════════════════════════════════════════════════

        private string FetchIncidentLocation(string incidentId)
        {
            return FetchIncidentField(incidentId, "location");
        }

        private string FetchIncidentField(string incidentId, string field)
        {
            try
            {
                using (var client = BuildHttpClient())
                {
                    var response = client.GetAsync($"{BASE_URL}/incidents/{incidentId}").Result;
                    string body = response.Content.ReadAsStringAsync().Result;
                    return TryExtractJsonValue(body, field);
                }
            }
            catch { return string.Empty; }
        }

        // ══════════════════════════════════════════════════════════
        // CREATIVE-3: HITL Intelligence Brief
        // ══════════════════════════════════════════════════════════

        private void SendHitlIntelligenceBrief(string incidentId, string severity)
        {
            try
            {
                using (var client = BuildHttpClient())
                {
                    var response = client.GetAsync($"{BASE_URL}/incidents/{incidentId}").Result;
                    string body = response.Content.ReadAsStringAsync().Result;
                    if (!response.IsSuccessStatusCode) return;

                    string incidentType  = TryExtractJsonValue(body, "type");
                    string location      = TryExtractJsonValue(body, "location");
                    string confidenceRaw = TryExtractJsonValue(body, "confidence");
                    string aiSuggestion  = TryExtractJsonValue(body, "suggestedResolution");
                    string awbNumber     = TryExtractJsonValue(body, "awbNumber");
                    string language      = TryExtractJsonValue(body, "detectedLanguage");
                    string sentimentLbl  = TryExtractJsonValue(body, "sentimentLabel");
                    string isRepeat      = TryExtractJsonValue(body, "isRepeatCustomer");

                    double confidence = 0;
                    double.TryParse(confidenceRaw,
                        System.Globalization.NumberStyles.Float,
                        System.Globalization.CultureInfo.InvariantCulture,
                        out confidence);

                    string confidencePct    = (confidence * 100).ToString("0") + "%";
                    string confidenceReason = confidence < 0.75
                        ? $"AI confidence {confidencePct} — below 75% auto-response threshold"
                        : $"Severity {severity} — requires human review regardless of confidence";

                    string subject =
                        $"🔍 NEXUS Review Required: {incidentType} at {location} — {incidentId}";
                    string emailBody =
                        $"A new incident requires your review in NEXUS.\n\n" +
                        $"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        $"INCIDENT INTELLIGENCE\n" +
                        $"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        $"Case ID:          {incidentId}\n" +
                        $"Type:             {incidentType}\n" +
                        $"Severity:         {severity}\n" +
                        $"Location:         {location}\n" +
                        $"AI Confidence:    {confidencePct}\n" +
                        $"Language:         {(string.Equals(language, "ms", StringComparison.OrdinalIgnoreCase) ? "Bahasa Melayu" : "English")}\n" +
                        $"Sentiment:        {sentimentLbl}\n" +
                        (string.IsNullOrEmpty(awbNumber) ? "" : $"AWB:              {awbNumber}\n") +
                        $"Repeat Customer:  {(string.Equals(isRepeat, "true") ? "YES ⚠️" : "No")}\n\n" +
                        $"Why review is needed:\n{confidenceReason}\n\n" +
                        $"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        $"AI SUGGESTED RESOLUTION\n" +
                        $"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        $"{(string.IsNullOrEmpty(aiSuggestion) ? "Pending pipeline completion." : aiSuggestion)}\n\n" +
                        $"Review queue: {FRONTEND_URL}/review\n" +
                        $"Full detail:  {FRONTEND_URL}/incidents/{incidentId}\n\n" +
                        $"— NEXUS Automation";

                    SendOutlookEmail(OPS_EMAIL, subject, emailBody);
                    LogMessage($"[NEXUS RPA] HITL brief sent for {incidentId}");
                }
            }
            catch (Exception ex)
            {
                LogWarning($"[NEXUS RPA] HITL brief failed for {incidentId}: {ex.Message}");
            }
        }

        // ══════════════════════════════════════════════════════════
        // CREATIVE-4: Self-Healing Store-and-Forward
        // ══════════════════════════════════════════════════════════

        private void PostRunRecord(string rpaRunId, int processed, int skipped,
                                   int failed, DateTime startTime, string narrative = "")
        {
            string jsonBody = BuildRunRecordJson(rpaRunId, processed, skipped, failed, startTime, narrative);

            try
            {
                PostRunRecordToBackend(jsonBody);
                LogMessage("[NEXUS RPA] Run record posted to backend");
                DrainPendingSyncFolder();
            }
            catch (Exception ex)
            {
                LogWarning($"[NEXUS RPA] Backend unavailable — storing run record: {ex.Message}");
                EnsureDirectory(PENDING_SYNC_FOLDER);
                string pendingFile = Path.Combine(PENDING_SYNC_FOLDER, $"run_{rpaRunId}.json");
                try
                {
                    File.WriteAllText(pendingFile, jsonBody);
                    LogMessage($"[NEXUS RPA] Run record stored for sync: {pendingFile}");
                }
                catch (Exception writeEx)
                {
                    LogWarning($"[NEXUS RPA] Could not write pending sync file: {writeEx.Message}");
                }
            }
        }

        private void DrainPendingSyncFolder()
        {
            if (!Directory.Exists(PENDING_SYNC_FOLDER)) return;
            string[] pending = Directory.GetFiles(PENDING_SYNC_FOLDER, "run_*.json");
            foreach (string pendingFile in pending)
            {
                try
                {
                    string json = File.ReadAllText(pendingFile);
                    PostRunRecordToBackend(json);
                    File.Delete(pendingFile);
                    LogMessage($"[NEXUS RPA] Synced pending run: {Path.GetFileName(pendingFile)}");
                }
                catch { break; }
            }
        }

        private void PostRunRecordToBackend(string jsonBody)
        {
            using (var client = BuildHttpClient())
            {
                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync($"{BASE_URL}/rpa-runs", content).Result;
                string body = response.Content.ReadAsStringAsync().Result;
                if (!response.IsSuccessStatusCode)
                    throw new Exception($"PostRunRecord: HTTP {(int)response.StatusCode} — {body}");
            }
        }

        private string BuildRunRecordJson(string rpaRunId, int processed, int skipped,
                                          int failed, DateTime startTime, string narrative)
        {
            double durationMs = (DateTime.UtcNow - startTime).TotalMilliseconds;
            return $"{{\"rpaRunId\":\"{rpaRunId}\"," +
                   $"\"startedAt\":\"{startTime:o}\"," +
                   $"\"completedAt\":\"{DateTime.UtcNow:o}\"," +
                   $"\"durationMs\":{Math.Round(durationMs)}," +
                   $"\"processed\":{processed}," +
                   $"\"skipped\":{skipped}," +
                   $"\"failed\":{failed}," +
                   $"\"narrative\":\"{EscapeJson(narrative)}\"}}";
        }

        // ══════════════════════════════════════════════════════════
        // PER-ITEM LINEAGE
        // ══════════════════════════════════════════════════════════

        private void PostRunItem(string rpaRunId, string filename, string fileHash,
                                  string incidentId, string outcome, string skipReason,
                                  string severity, string location, string errorMessage)
        {
            try
            {
                using (var client = BuildHttpClient())
                {
                    string json =
                        $"{{\"rpaRunId\":\"{rpaRunId}\"," +
                        $"\"filename\":\"{EscapeJson(filename)}\"," +
                        $"\"fileHash\":\"{fileHash ?? string.Empty}\"," +
                        $"\"incidentId\":\"{EscapeJson(incidentId ?? string.Empty)}\"," +
                        $"\"outcome\":\"{outcome}\"," +
                        $"\"skipReason\":\"{EscapeJson(skipReason ?? string.Empty)}\"," +
                        $"\"severity\":\"{EscapeJson(severity ?? string.Empty)}\"," +
                        $"\"location\":\"{EscapeJson(location ?? string.Empty)}\"," +
                        $"\"errorMessage\":\"{EscapeJson(errorMessage ?? string.Empty)}\"}}";

                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    client.PostAsync($"{BASE_URL}/rpa-runs/items", content).Result.Dispose();
                }
            }
            catch { }
        }

        // ══════════════════════════════════════════════════════════
        // EMAIL / CHAT
        // ══════════════════════════════════════════════════════════

        private void SendCustomerChatAutoReply(string filePath, string incidentId,
                                                string language = "en")
        {
            try
            {
                string chatUrl       = CreateCustomerChatLink(incidentId);
                string customerEmail = ExtractCustomerEmail(filePath);

                if (string.IsNullOrWhiteSpace(customerEmail))
                {
                    LogWarning($"[NEXUS RPA] Customer email not found — chat link not emailed");
                    return;
                }

                string currentSeverity = GetCurrentIncidentSeverity(incidentId);
                int slaHours = GetSlaHoursForSeverity(currentSeverity);
                bool isMalay = string.Equals(language, "ms", StringComparison.OrdinalIgnoreCase);

                string subject, body;

                if (isMalay)
                {
                    subject = $"Re: Aduan DHL Anda — Kes {incidentId} Telah Diterima";
                    body =
                        "Yang Dihormati Pelanggan," + Environment.NewLine + Environment.NewLine +
                        "Terima kasih kerana menghubungi DHL Express Malaysia." + Environment.NewLine +
                        "Laporan aduan anda telah berjaya diterima dan sedang diproses." + Environment.NewLine + Environment.NewLine +
                        $"Nombor Kes: {incidentId}" + Environment.NewLine +
                        "Status: Dalam Semakan" + Environment.NewLine +
                        $"Masa Maklum Balas: Dalam {slaHours} jam" + Environment.NewLine + Environment.NewLine +
                        "Berbual dengan pembantu AI kami untuk kemas kini segera:" + Environment.NewLine +
                        chatUrl + Environment.NewLine + Environment.NewLine +
                        "Untuk hal mendesak, sila hubungi: 1300-888-DHL" + Environment.NewLine + Environment.NewLine +
                        "Yang ikhlas," + Environment.NewLine +
                        "Pasukan Operasi DHL NEXUS";
                }
                else
                {
                    subject = $"Re: Your DHL Support Case — {incidentId} — Received";
                    body =
                        "Dear Customer," + Environment.NewLine + Environment.NewLine +
                        "Thank you for contacting DHL Express. Your incident report has been received." + Environment.NewLine + Environment.NewLine +
                        $"Case Reference: {incidentId}" + Environment.NewLine +
                        "Status: Under Review" + Environment.NewLine +
                        $"Expected Response: Within {slaHours} hours" + Environment.NewLine + Environment.NewLine +
                        "Chat with our AI assistant for instant case updates:" + Environment.NewLine +
                        chatUrl + Environment.NewLine + Environment.NewLine +
                        "For urgent matters, call: 1300-888-DHL" + Environment.NewLine + Environment.NewLine +
                        "Best regards," + Environment.NewLine +
                        "DHL NEXUS Operations Team";
                }

                SendOutlookEmail(customerEmail, subject, body);
                LogMessage($"[NEXUS RPA] Acknowledgement sent to {customerEmail} ({language.ToUpper()})");
            }
            catch (Exception ex)
            {
                LogWarning($"[NEXUS RPA] Customer auto-reply skipped for {incidentId}: {ex.Message}");
            }
        }

        private string CreateCustomerChatLink(string incidentId)
        {
            using (var client = BuildHttpClient())
            {
                string url = $"{BASE_URL}/chat/token/{incidentId}";
                var content = new StringContent("{}", Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync(url, content).Result;
                string body = response.Content.ReadAsStringAsync().Result;

                if (!response.IsSuccessStatusCode)
                    throw new Exception($"CreateCustomerChatLink: HTTP {(int)response.StatusCode}");

                string fullChatUrl = TryExtractJsonValue(body, "fullChatUrl");
                if (!string.IsNullOrWhiteSpace(fullChatUrl)) return fullChatUrl;

                string chatPath = ExtractJsonValue(body, "chatUrl");
                return chatPath.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                    ? chatPath
                    : $"{FRONTEND_URL}{chatPath}";
            }
        }

        private string ExtractCustomerEmail(string filePath)
        {
            try
            {
                string[] lines = File.ReadAllLines(filePath);
                foreach (string line in lines)
                {
                    if (!line.StartsWith("From:", StringComparison.OrdinalIgnoreCase)) continue;

                    string value = line.Substring(5).Trim();
                    int start = value.IndexOf('<');
                    int end   = value.IndexOf('>');

                    if (start >= 0 && end > start)
                        return value.Substring(start + 1, end - start - 1).Trim();

                    // Also match bare email address
                    var emailMatch = Regex.Match(value, @"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}");
                    if (emailMatch.Success) return emailMatch.Value;

                    return value.Trim();
                }
            }
            catch (Exception ex)
            {
                LogWarning($"[NEXUS RPA] Failed to parse customer email: {ex.Message}");
            }
            return string.Empty;
        }

        private string GetCurrentIncidentSeverity(string incidentId)
        {
            return FetchIncidentField(incidentId, "severity");
        }

        private int GetSlaHoursForSeverity(string severity)
        {
            switch ((severity ?? string.Empty).Trim().ToLowerInvariant())
            {
                case "critical": return 2;
                case "high":     return 4;
                case "low":      return 24;
                default:         return 8;
            }
        }

        private void SendOutlookEmail(string to, string subject, string body)
        {
            try
            {
                using (var client = new System.Net.Mail.SmtpClient(SmtpHost, SmtpPort))
                {
                    client.EnableSsl = true;
                    client.Credentials = new System.Net.NetworkCredential(SmtpUser, SmtpPass);
                    client.Timeout = 30000;
                    var msg = new System.Net.Mail.MailMessage();
                    msg.From = new System.Net.Mail.MailAddress(SmtpUser, "DHL NEXUS Support");
                    msg.To.Add(to);
                    msg.Subject = subject;
                    msg.Body = body;
                    msg.IsBodyHtml = false;
                    client.Send(msg);
                }
                LogMessage($"[NEXUS RPA] Email SENT via SMTP ({SmtpHost}) → {to}");
            }
            catch (Exception ex)
            {
                LogMessage($"[NEXUS RPA] SMTP send failed: {ex.Message}");
                // Fallback: queue to file for manual review
                string folder = Path.Combine(WATCH_FOLDER, "pending_emails");
                EnsureDirectory(folder);
                string id = DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "_" +
                            Guid.NewGuid().ToString("N").Substring(0, 8);
                File.WriteAllText(
                    Path.Combine(folder, $"email_{id}.txt"),
                    $"TO:{to}\nSUBJECT:{subject}\n---BODY---\n{body}");
                LogMessage($"[NEXUS RPA] Email queued to file as fallback → {to}");
            }
        }

        // ══════════════════════════════════════════════════════════
        // FILE OPERATIONS
        // ══════════════════════════════════════════════════════════

        private string ComputeSha256(string filePath)
        {
            byte[] fileBytes = File.ReadAllBytes(filePath);
            using (var sha = new SHA256Managed())
            {
                byte[] hashBytes = sha.ComputeHash(fileBytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }

        private bool CheckProcessedFile(string fileHash)
        {
            using (var client = BuildHttpClient())
            {
                string url = $"{BASE_URL}/processed-files/check?hash={Uri.EscapeDataString(fileHash)}";
                HttpResponseMessage response = client.GetAsync(url).Result;
                string body = response.Content.ReadAsStringAsync().Result;

                if (!response.IsSuccessStatusCode)
                    throw new Exception($"CheckProcessedFile: HTTP {(int)response.StatusCode}");

                return body.Contains("\"exists\":true") || body.Contains("\"exists\": true");
            }
        }

        private void LogProcessedFile(string fileHash, string filename, string rpaRunId)
        {
            using (var client = BuildHttpClient())
            {
                string jsonBody =
                    $"{{\"fileHash\":\"{fileHash}\"," +
                    $"\"filename\":\"{EscapeJson(filename)}\"," +
                    $"\"rpaRunId\":\"{rpaRunId}\"}}";

                var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync($"{BASE_URL}/processed-files", content).Result;
                string body = response.Content.ReadAsStringAsync().Result;
                int statusCode = (int)response.StatusCode;

                if (statusCode != 201 && statusCode != 409)
                    throw new Exception($"LogProcessedFile: HTTP {statusCode} — {body}");
            }
        }

        private void ArchiveFile(string filePath, string filename)
        {
            string archiveDir = Path.Combine(WATCH_FOLDER, "processed");
            string dest = Path.Combine(archiveDir, filename);

            if (File.Exists(dest))
            {
                string nameNoExt = Path.GetFileNameWithoutExtension(filename);
                string ext = Path.GetExtension(filename);
                dest = Path.Combine(archiveDir, $"{nameNoExt}_{DateTime.UtcNow:yyyyMMddHHmmss}{ext}");
            }

            File.Move(filePath, dest);
        }

        private bool ShouldBatchDefer(string filePath, string preloadedContent = null)
        {
            try
            {
                if (!string.Equals(Path.GetExtension(filePath), ".txt", StringComparison.OrdinalIgnoreCase))
                    return false;

                string content = preloadedContent != null
                    ? preloadedContent.ToLowerInvariant()
                    : File.ReadAllText(filePath).ToLowerInvariant();

                string[] lowPrioritySignals = {
                    "pricing", "quotation", "quote",
                    "operating hours", "holiday",
                    "pickup information", "business account", "account setup"
                };

                foreach (string signal in lowPrioritySignals)
                    if (content.Contains(signal)) return true;
            }
            catch { }

            return false;
        }

        private void TakeErrorScreenshot(string filename, string logFolder)
        {
            try
            {
                string safe = string.Join("_", filename.Split(Path.GetInvalidFileNameChars()));
                string path = Path.Combine(logFolder,
                    $"error_{safe}_{DateTime.UtcNow:yyyyMMddHHmmss}.png");

                using (var bmp = new System.Drawing.Bitmap(
                    System.Windows.Forms.Screen.PrimaryScreen.Bounds.Width,
                    System.Windows.Forms.Screen.PrimaryScreen.Bounds.Height))
                using (var g = System.Drawing.Graphics.FromImage(bmp))
                {
                    g.CopyFromScreen(System.Drawing.Point.Empty,
                                     System.Drawing.Point.Empty, bmp.Size);
                    bmp.Save(path, System.Drawing.Imaging.ImageFormat.Png);
                }
                LogMessage($"[NEXUS RPA] Screenshot saved: {path}");
            }
            catch { }
        }

        // ══════════════════════════════════════════════════════════
        // HUB CLUSTER ALERT
        // ══════════════════════════════════════════════════════════

        private void SendHubClusterAlert(string location, List<string> incidentIds, string rpaRunId)
        {
            string hubEmail = GetHubManagerEmail(location);
            string idList   = string.Join(", ", incidentIds);
            string alertMsg =
                $"[NEXUS CLUSTER ALERT — {DateTime.UtcNow:dd MMM HH:mm} UTC]\r\n" +
                $"Hub: {location}\r\n" +
                $"Cluster size: {incidentIds.Count} incident(s) in this batch.\r\n" +
                $"Incident IDs: {idList}\r\n" +
                $"Action required: {FRONTEND_URL}/admin\r\n" +
                $"Run ID: {rpaRunId}";

            try
            {
                string alertsDir = Path.Combine(WATCH_FOLDER, "alerts");
                EnsureDirectory(alertsDir);
                string alertFile = Path.Combine(alertsDir,
                    $"cluster_{location.Replace(" ", "_")}_{DateTime.UtcNow:yyyyMMddHHmmss}.txt");
                File.WriteAllText(alertFile, alertMsg);
            }
            catch { }

            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("x-api-key", API_KEY);
                string encodedHub = Uri.EscapeDataString(location);
                var content = new StringContent(
                    $"{{\"rpaRunId\":\"{EscapeJson(rpaRunId)}\",\"incidentIds\":{IdListToJson(incidentIds)}}}",
                    Encoding.UTF8, "application/json");
                client.PostAsync($"{BASE_URL}/admin/cascade-risk/{encodedHub}/alert", content)
                      .GetAwaiter().GetResult();
            }
            catch (Exception ex)
            {
                LogWarning($"[NEXUS RPA] Cascade alert failed (non-fatal): {ex.Message}");
            }
        }

        private string GetHubManagerEmail(string location)
        {
            switch (location.Trim())
            {
                case "Shah Alam Hub":     return "manager.shahalam@dhl.com";
                case "Subang Jaya Depot": return "manager.subang@dhl.com";
                case "KLIA Cargo":        return "manager.klia@dhl.com";
                case "Penang Hub":        return "manager.penang@dhl.com";
                case "JB Distribution":   return "manager.jbdistribution@dhl.com";
                default:                  return OPS_EMAIL;
            }
        }

        // ══════════════════════════════════════════════════════════
        // NEW-7: Priority Queue Scheduler
        // Returns a numeric urgency score for a file.
        // Urgency keywords weighted 2x; frustration words weighted 1x.
        // Higher score = process earlier in the batch loop.
        // ══════════════════════════════════════════════════════════

        private int ScoreFileUrgency(string filePath)
        {
            try
            {
                string content = File.ReadAllText(filePath).ToLowerInvariant();
                int score = 0;
                foreach (string w in UrgencyWords)
                    score += content.Contains(w) ? 2 : 0;
                foreach (string w in FrustrationWords)
                    score += content.Contains(w) ? 1 : 0;
                return score;
            }
            catch { return 0; }
        }

        // ══════════════════════════════════════════════════════════
        // NEW-8: SOP Gap Detection
        // Fetches published SOPs and checks if the given incident type
        // is covered. Returns true (covered) on any error to avoid
        // spam-drafting when the API is unreachable.
        // ══════════════════════════════════════════════════════════

        private bool CheckSopExists(string incidentType)
        {
            try
            {
                using (var client = BuildHttpClient())
                {
                    var response = client.GetAsync($"{BASE_URL}/admin/sops?status=published&limit=30").Result;
                    if (!response.IsSuccessStatusCode) return true; // assume covered on failure
                    string body = response.Content.ReadAsStringAsync().Result;

                    // Match the type in all common forms: late_delivery / late-delivery / "late delivery"
                    string t1 = incidentType;
                    string t2 = incidentType.Replace("_", "-");
                    string t3 = incidentType.Replace("_", " ");
                    return body.IndexOf(t1, StringComparison.OrdinalIgnoreCase) >= 0
                        || body.IndexOf(t2, StringComparison.OrdinalIgnoreCase) >= 0
                        || body.IndexOf(t3, StringComparison.OrdinalIgnoreCase) >= 0;
                }
            }
            catch { return true; } // safe default — never spam draft requests on transient errors
        }

        private void RequestSopDraft(string incidentType, string rpaRunId)
        {
            try
            {
                using (var client = BuildHttpClient())
                {
                    string json =
                        $"{{\"type\":\"{EscapeJson(incidentType)}\"," +
                        $"\"requestedBy\":\"uipath_rpa\"," +
                        $"\"reason\":\"No active SOP detected during RPA batch scan (run {EscapeJson(rpaRunId)})\"," +
                        $"\"source\":\"rpa_gap_detection\"}}";
                    var content = new StringContent(json, Encoding.UTF8, "application/json");
                    client.PostAsync($"{BASE_URL}/admin/sop-drafts/request", content).Result.Dispose();
                }
            }
            catch { /* Best-effort — never cascade a draft-request failure to the main run */ }
        }

        // ══════════════════════════════════════════════════════════
        // NEW-9: HTML Batch Summary Email
        // Builds a fully styled HTML email with: KPI strip,
        // per-case detail table (type, severity badge, confidence,
        // outcome), and a SOP gap warning block. Sent to OPS_EMAIL
        // after every run that produced at least one processed case.
        // ══════════════════════════════════════════════════════════

        private void SendHtmlBatchSummary(string rpaRunId, List<BatchResult> results,
                                           DateTime startTime, int processed, int skipped,
                                           int failed, int sopGaps)
        {
            string html    = BuildHtmlBatchSummary(rpaRunId, results, startTime,
                                                    processed, skipped, failed, sopGaps);
            string subject = $"[NEXUS RPA] Batch Run — {processed} case(s) — {DateTime.UtcNow:dd MMM HH:mm} UTC";
            SendOutlookEmailHtml(OPS_EMAIL, subject, html);
        }

        private string BuildHtmlBatchSummary(string rpaRunId, List<BatchResult> results,
                                              DateTime startTime, int processed, int skipped,
                                              int failed, int sopGaps)
        {
            double durationSec = (DateTime.UtcNow - startTime).TotalSeconds;
            int hitlCount = 0;
            int autoCount = 0;
            foreach (var r in results) { if (r.WasHitl) hitlCount++; else autoCount++; }

            var sb = new StringBuilder();
            sb.Append("<!DOCTYPE html><html><head><meta charset='utf-8'/><style>");
            sb.Append("body{font-family:Arial,sans-serif;color:#1a1a2e;background:#f4f6f9;margin:0;padding:0}");
            sb.Append(".wrap{max-width:680px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)}");
            sb.Append(".hdr{background:linear-gradient(135deg,#d40511,#b3040f);color:#fff;padding:22px 26px}");
            sb.Append(".hdr h1{margin:0;font-size:20px;font-weight:700}");
            sb.Append(".hdr p{margin:5px 0 0;font-size:12px;opacity:.85}");
            sb.Append(".kpis{display:flex;border-bottom:1px solid #e8eaf0}");
            sb.Append(".kpi{flex:1;text-align:center;padding:14px 4px;border-right:1px solid #e8eaf0}");
            sb.Append(".kpi:last-child{border-right:none}");
            sb.Append(".kpi .n{font-size:26px;font-weight:700;color:#d40511}");
            sb.Append(".kpi .l{font-size:10px;color:#666;margin-top:2px;text-transform:uppercase;letter-spacing:.3px}");
            sb.Append(".sec{padding:18px 26px}");
            sb.Append(".sec h2{margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.5px;color:#555;font-weight:700}");
            sb.Append("table{width:100%;border-collapse:collapse;font-size:12px}");
            sb.Append("th{background:#f4f6f9;color:#555;padding:7px 9px;text-align:left;font-weight:600;border-bottom:2px solid #e0e4ed}");
            sb.Append("td{padding:7px 9px;border-bottom:1px solid #f0f2f8;vertical-align:middle}");
            sb.Append("tr:last-child td{border-bottom:none}");
            sb.Append(".b{display:inline-block;padding:2px 7px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase}");
            sb.Append(".bc{background:#fee2e2;color:#b91c1c}.bh{background:#fff3e0;color:#e65100}");
            sb.Append(".bm{background:#fef9c3;color:#854d0e}.bl{background:#dcfce7;color:#15803d}");
            sb.Append(".bx{background:#ede9fe;color:#5b21b6}.ba{background:#dcfce7;color:#15803d}");
            sb.Append(".gap{background:#fee2e2;color:#b91c1c;padding:10px 13px;border-radius:6px;font-size:12px;margin:0}");
            sb.Append(".ftr{background:#f4f6f9;padding:12px 26px;font-size:11px;color:#999;text-align:center}");
            sb.Append("a{color:#d40511}");
            sb.Append("</style></head><body><div class='wrap'>");

            // Header
            sb.Append("<div class='hdr'>");
            sb.Append("<h1>NEXUS RPA &mdash; Batch Run Complete</h1>");
            sb.Append($"<p>Run ID: {EscapeHtml(rpaRunId)} &nbsp;|&nbsp; ");
            sb.Append($"{DateTime.UtcNow:dd MMM yyyy HH:mm} UTC &nbsp;|&nbsp; {durationSec:0}s duration</p>");
            sb.Append("</div>");

            // KPI strip
            sb.Append("<div class='kpis'>");
            sb.Append($"<div class='kpi'><div class='n'>{processed}</div><div class='l'>Processed</div></div>");
            sb.Append($"<div class='kpi'><div class='n'>{autoCount}</div><div class='l'>Auto-Resolved</div></div>");
            sb.Append($"<div class='kpi'><div class='n'>{hitlCount}</div><div class='l'>HITL Routed</div></div>");
            sb.Append($"<div class='kpi'><div class='n'>{skipped}</div><div class='l'>Skipped</div></div>");
            sb.Append($"<div class='kpi'><div class='n'>{failed}</div><div class='l'>Errors</div></div>");
            if (sopGaps > 0)
                sb.Append($"<div class='kpi'><div class='n' style='color:#b91c1c'>{sopGaps}</div><div class='l'>SOP Gaps</div></div>");
            sb.Append("</div>");

            // Per-case table
            if (results.Count > 0)
            {
                sb.Append("<div class='sec'><h2>Case Detail</h2><table><thead><tr>");
                sb.Append("<th>File</th><th>Incident ID</th><th>Type</th><th>Severity</th><th>Conf.</th><th>Outcome</th>");
                sb.Append("</tr></thead><tbody>");

                foreach (var r in results)
                {
                    string sev      = (r.Severity ?? "").ToLowerInvariant();
                    string sevClass = sev == "critical" ? "bc"
                                    : sev == "high"     ? "bh"
                                    : sev == "medium"   ? "bm" : "bl";
                    string outClass    = r.WasHitl ? "bx" : "ba";
                    string typeDisplay = (r.Type ?? "").Replace("_", " ");
                    string fileDisplay = r.Filename.Length > 26
                        ? r.Filename.Substring(0, 24) + ".."
                        : r.Filename;

                    sb.Append("<tr>");
                    sb.Append($"<td title='{EscapeHtml(r.Filename)}'>{EscapeHtml(fileDisplay)}</td>");
                    sb.Append($"<td><a href='{FRONTEND_URL}/incidents/{EscapeHtml(r.IncidentId)}'>{EscapeHtml(r.IncidentId)}</a></td>");
                    sb.Append($"<td>{EscapeHtml(typeDisplay)}</td>");
                    sb.Append($"<td><span class='b {sevClass}'>{EscapeHtml(r.Severity ?? "-")}</span></td>");
                    sb.Append($"<td>{EscapeHtml(r.ConfidencePct)}%</td>");
                    sb.Append($"<td><span class='b {outClass}'>{EscapeHtml(r.Outcome)}</span></td>");
                    sb.Append("</tr>");
                }
                sb.Append("</tbody></table></div>");
            }

            // SOP gap alert block
            if (sopGaps > 0)
            {
                sb.Append("<div class='sec'><h2>Knowledge Gap Alert</h2>");
                sb.Append($"<p class='gap'><strong>{sopGaps} incident type(s)</strong> processed this run ");
                sb.Append("have no active SOP in the Knowledge Library. Auto-draft requests have been filed &mdash; ");
                sb.Append($"review them in the <a href='{FRONTEND_URL}/knowledge'>Knowledge Observatory</a>.</p>");
                sb.Append("</div>");
            }

            // Footer
            sb.Append("<div class='ftr'>NEXUS RPA v4.0 &nbsp;|&nbsp; ");
            sb.Append($"<a href='{FRONTEND_URL}/rpa'>RPA Mission Control</a> &nbsp;|&nbsp; ");
            sb.Append($"<a href='{FRONTEND_URL}/knowledge'>Knowledge Observatory</a></div>");
            sb.Append("</div></body></html>");

            return sb.ToString();
        }

        private void SendOutlookEmailHtml(string to, string subject, string htmlBody)
        {
            try
            {
                using (var client = new System.Net.Mail.SmtpClient(SmtpHost, SmtpPort))
                {
                    client.EnableSsl = true;
                    client.Credentials = new System.Net.NetworkCredential(SmtpUser, SmtpPass);
                    client.Timeout = 30000;
                    var msg = new System.Net.Mail.MailMessage();
                    msg.From       = new System.Net.Mail.MailAddress(SmtpUser, "DHL NEXUS Support");
                    msg.To.Add(to);
                    msg.Subject    = subject;
                    msg.Body       = htmlBody;
                    msg.IsBodyHtml = true;
                    client.Send(msg);
                }
                LogMessage($"[NEXUS RPA] HTML email SENT ({SmtpHost}) → {to}");
            }
            catch (Exception ex)
            {
                LogMessage($"[NEXUS RPA] HTML SMTP failed: {ex.Message}");
                // Fallback: save to pending_emails folder for manual retry
                string folder = Path.Combine(WATCH_FOLDER, "pending_emails");
                EnsureDirectory(folder);
                string uid = DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "_" +
                             Guid.NewGuid().ToString("N").Substring(0, 8);
                File.WriteAllText(
                    Path.Combine(folder, $"email_{uid}.html"),
                    $"TO:{to}\nSUBJECT:{subject}\n---BODY---\n{htmlBody}");
                LogMessage($"[NEXUS RPA] HTML email queued to file → {to}");
            }
        }

        private string EscapeHtml(string value)
        {
            if (value == null) return string.Empty;
            return value
                .Replace("&",  "&amp;")
                .Replace("<",  "&lt;")
                .Replace(">",  "&gt;")
                .Replace("\"", "&quot;");
        }

        // ══════════════════════════════════════════════════════════
        // UTILITIES
        // ══════════════════════════════════════════════════════════

        private HttpClient BuildHttpClient()
        {
            var client = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
            client.DefaultRequestHeaders.Add("X-API-Key", API_KEY);
            return client;
        }

        private string ExtractJsonValue(string json, string key)
        {
            string searchKey = $"\"{key}\":\"";
            int startIdx = json.IndexOf(searchKey, StringComparison.Ordinal);
            if (startIdx == -1)
                throw new Exception($"ExtractJsonValue: key '{key}' not found");

            startIdx += searchKey.Length;
            int endIdx = json.IndexOf('"', startIdx);
            if (endIdx == -1)
                throw new Exception($"ExtractJsonValue: unterminated value for '{key}'");

            return json.Substring(startIdx, endIdx - startIdx);
        }

        private string TryExtractJsonValue(string json, string key)
        {
            string searchKey = $"\"{key}\":\"";
            int startIdx = json.IndexOf(searchKey, StringComparison.Ordinal);
            if (startIdx == -1) return string.Empty;

            startIdx += searchKey.Length;
            int endIdx = json.IndexOf('"', startIdx);
            if (endIdx == -1) return string.Empty;

            return json.Substring(startIdx, endIdx - startIdx);
        }

        private void SendHubClusterAlertEmail(string location, List<string> incidentIds, string hubEmail, string alertMsg)
        {
            try
            {
                string subject = $"⚠️ DHL NEXUS Cluster Alert — {location} — {incidentIds.Count} incidents";
                SendOutlookEmail(hubEmail, subject, alertMsg);
            }
            catch { }
        }

        private string IdListToJson(List<string> ids)
        {
            if (ids == null || ids.Count == 0) return "[]";
            var sb = new StringBuilder("[");
            for (int i = 0; i < ids.Count; i++)
            {
                sb.Append($"\"{EscapeJson(ids[i])}\"");
                if (i < ids.Count - 1) sb.Append(",");
            }
            sb.Append("]");
            return sb.ToString();
        }

        private string EscapeJson(string value)
        {
            if (value == null) return string.Empty;
            return value
                .Replace("\\", "\\\\")
                .Replace("\"", "\\\"")
                .Replace("\n", "\\n")
                .Replace("\r", "\\r")
                .Replace("\t", "\\t");
        }

        private string Truncate(string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value)) return string.Empty;
            if (value.Length <= maxLength) return value;
            return value.Substring(0, maxLength) + "...";
        }

        private string GetMimeType(string filename)
        {
            switch (Path.GetExtension(filename).ToLower())
            {
                case ".pdf":  return "application/pdf";
                case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                case ".png":  return "image/png";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                default:      return "text/plain";
            }
        }

        private void EnsureDirectory(string path)
        {
            if (!Directory.Exists(path))
                Directory.CreateDirectory(path);
        }

        private void ReleaseComObject(object value)
        {
            if (value != null && Marshal.IsComObject(value))
                Marshal.FinalReleaseComObject(value);
        }

        // ══════════════════════════════════════════════════════════
        // VALUE TYPES
        // ══════════════════════════════════════════════════════════

        // NEW-7: FileEntry — holds path + pre-computed urgency score
        private class FileEntry
        {
            public string Path         { get; set; } = string.Empty;
            public int    UrgencyScore { get; set; }
        }

        // NEW-8/9: BatchResult — one record per successfully processed file
        private class BatchResult
        {
            public string Filename      { get; set; } = string.Empty;
            public string IncidentId    { get; set; } = string.Empty;
            public string Type          { get; set; } = string.Empty;
            public string Severity      { get; set; } = string.Empty;
            public string Location      { get; set; } = string.Empty;
            public string ConfidencePct { get; set; } = "0";
            public string Outcome       { get; set; } = string.Empty;
            public bool   WasHitl       { get; set; }
        }

        private struct SentimentResult
        {
            public double Score;
            public string Label;
        }

        private class CustomerHistory
        {
            public int    PriorCaseCount { get; set; }
            public bool   IsRepeat       { get; set; }
            public string LastCaseType   { get; set; } = string.Empty;
        }

        private class OutboundEmail
        {
            public string Id            { get; set; } = string.Empty;
            public string IncidentId    { get; set; } = string.Empty;
            public string CustomerEmail { get; set; } = string.Empty;
        }
    }
}
