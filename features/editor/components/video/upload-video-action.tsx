import { handleVideoUpload } from "@/features/editor/extensions/lib";
import { uploadFile } from "@/shared/page/services/page-service";
import { notifications } from "@mantine/notifications";
import { getFileUploadSizeLimit } from "@/lib/config";
import { formatBytes } from "@/lib";

export const uploadVideoAction = handleVideoUpload({
    onUpload: async (file: File, pageId: string): Promise<any> => {
        try {
            return await uploadFile(file, pageId);
        } catch (err) {
            notifications.show({
                color: "red",
                // @ts-ignore
                message: err?.response.data.message,
            });
            throw err;
        }
    },
    validateFn: (file) => {
        if (!file.type.includes("video/")) {
            return false;
        }

        if (file.size > getFileUploadSizeLimit()!) {
            notifications.show({
                color: "red",
                message: `File exceeds the ${formatBytes(getFileUploadSizeLimit()!)} attachment limit`,
            });
            return false;
        }
        return true;
    },
});

