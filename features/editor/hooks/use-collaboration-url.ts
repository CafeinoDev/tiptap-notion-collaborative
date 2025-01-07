import { getCollaborationUrl } from "@/lib/config";

const useCollaborationURL = (): string => {
    return getCollaborationUrl();
};

export default useCollaborationURL;
