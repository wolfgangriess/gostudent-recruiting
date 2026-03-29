import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

async function getProviderToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.provider_token;
  if (!token) {
    throw new Error(
      "No Google provider token — sign in via GoStudent SSO or Google to use Drive."
    );
  }
  return token;
}

/** Find or create a Google Drive folder by name, return its ID */
async function findOrCreateFolder(token: string, folderName: string): Promise<string> {
  const q = encodeURIComponent(
    `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const searchData = await searchRes.json() as { files?: { id: string }[] };
  if (searchData.files && searchData.files.length > 0) return searchData.files[0].id;

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  const createData = await createRes.json() as { id: string };
  return createData.id;
}

export const useGoogleDrive = () => {
  /**
   * Upload a CV file to Google Drive under "GoStudent Recruiting/[candidateName]".
   * Returns the Drive file ID and a viewable URL.
   */
  const uploadCV = useCallback(async (
    file: File,
    candidateName: string,
  ): Promise<{ driveFileId: string; viewUrl: string }> => {
    const token = await getProviderToken();

    // Find/create parent folder "GoStudent Recruiting"
    const parentId = await findOrCreateFolder(token, "GoStudent Recruiting");

    const ext = file.name.split(".").pop() ?? "pdf";
    const metadata = {
      name: `${candidateName} - CV.${ext}`,
      parents: [parentId],
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    const uploadRes = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error(
        (err as { error?: { message?: string } })?.error?.message ??
          "Failed to upload CV to Google Drive"
      );
    }

    const data = await uploadRes.json() as { id: string; webViewLink: string };
    return { driveFileId: data.id, viewUrl: data.webViewLink };
  }, []);

  /** Return a viewable URL for a Drive file (just constructs the URL from the ID) */
  const getFileUrl = useCallback((driveFileId: string): string => {
    return `https://drive.google.com/file/d/${driveFileId}/view`;
  }, []);

  return { uploadCV, getFileUrl };
};
