const WEBHOOK_URL = 'https://myupgrade.app.n8n.cloud/webhook/36048ae7-5a48-408d-b5cc-4472d7d62c8f';

export interface WebhookPayload {
  filename: string;
  fileData: string; // Base64 encoded file
  documentType: string;
  uploadId: string;
}

export const sendToWebhook = async (file: File, uploadId: string, documentType: string): Promise<any> => {
  try {
    // Convertir archivo a base64
    const fileData = await fileToBase64(file);
    
    const payload: WebhookPayload = {
      filename: file.name,
      fileData: fileData,
      documentType: documentType,
      uploadId: uploadId
    };

    console.log('Enviando al webhook:', WEBHOOK_URL);
    console.log('Payload:', { 
      filename: payload.filename, 
      documentType: payload.documentType, 
      uploadId: payload.uploadId,
      fileSize: payload.fileData.length 
    });

    // Enviar al webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Respuesta del webhook:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error del webhook:', errorText);
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Resultado del webhook:', result);

    return {
      success: true,
      webhookResponse: result
    };

  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remover el prefijo "data:application/pdf;base64,"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};