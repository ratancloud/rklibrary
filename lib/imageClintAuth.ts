export const authenticator = async (): Promise<{
  signature: string;
  expire: number;
  token: string;
  publicKey: string;
}> => {
  try {
    const response = await fetch("/api/upload-auth");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    // Parse and destructure the response JSON for upload credentials.
    const data = await response.json();
    const { signature, expire, token, publicKey } = data;
    return { signature, expire, token, publicKey };
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Authentication request failed");
  }
};
