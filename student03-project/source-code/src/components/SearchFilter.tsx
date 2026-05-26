import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  tag: string;
  setTag: (v: string) => void;
  creator: string;
  setCreator: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
}

export default function SearchFilter({
  search,
  setSearch,
  status,
  setStatus,
  tag,
  setTag,
  creator,
  setCreator,
  date,
  setDate,
}: Props) {
  const hasFilters = search || status || tag || creator || date;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search title or summary..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          onValueChange={(v) => setStatus(v === "all" ? "" : v)}
          value={status || "all"}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Reviewed">Reviewed</SelectItem>
            <SelectItem value="Published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Filter by tag..."
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="max-w-[160px]"
        />
        <Input
          placeholder="Filter by creator..."
          value={creator}
          onChange={(e) => setCreator(e.target.value)}
          className="max-w-[160px]"
        />
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-[160px]"
        />
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setStatus("");
              setTag("");
              setCreator("");
              setDate("");
            }}
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
