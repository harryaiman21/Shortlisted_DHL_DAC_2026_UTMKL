import axios from 'axios';

export const runUiPathBot = async (req, res) => {
    try {
        console.log('CLIENT ID:', process.env.UIPATH_CLIENT_ID);
        console.log('SECRET LENGTH:', process.env.UIPATH_CLIENT_SECRET?.length);
        console.log('ACCOUNT:', process.env.UIPATH_ACCOUNT);
        console.log('TENANT:', process.env.UIPATH_TENANT);
        console.log('FOLDER:', process.env.UIPATH_FOLDER_ID);
        console.log('PROCESS:', process.env.UIPATH_PROCESS_NAME);

        const authResponse = await axios.post(
            `https://cloud.uipath.com/${process.env.UIPATH_ACCOUNT}/identity_/connect/token`,
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: process.env.UIPATH_CLIENT_ID,
                client_secret: process.env.UIPATH_CLIENT_SECRET,
                scope: 'OR.Execution OR.Jobs'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const accessToken = authResponse.data.access_token;
        console.log('✅ UiPath token generated');

        const startJobResponse = await axios.post(
            `https://cloud.uipath.com/${process.env.UIPATH_ACCOUNT}/${process.env.UIPATH_TENANT}/orchestrator_/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs`,
            {
                startInfo: {
                    ReleaseName: process.env.UIPATH_PROCESS_NAME,
                    Strategy: 'JobsCount',
                    JobsCount: 1,
                    Source: 'Manual'
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'X-UIPATH-OrganizationUnitId': process.env.UIPATH_FOLDER_ID,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('🚀 UiPath bot started');

        return res.status(200).json({
            success: true,
            message: 'UiPath bot started successfully',
            data: startJobResponse.data
        });

    } catch (error) {
        console.error('❌ UiPath Bot Error:', error.response?.data || error.message);

        return res.status(500).json({
            success: false,
            message: error.response?.data || error.message
        });
    }
};