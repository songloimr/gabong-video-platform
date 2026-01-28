export type VideoStatus = "pending_approval" | "pending_processing" | "processing" | "approved" | "rejected" | "hidden"

export enum VideoSourceType {
    UPLOAD = "upload",
    EMBED = "embed",
}
