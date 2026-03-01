
export const reportIssueToGoogleChat = async (txId: string, description: string, agentName: string) => {
  const webhookUrl = 'https://chat.googleapis.com/v1/spaces/AAQALwf4CPM/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=13cPCaPs6q9IMy9YWypySynE-AiKeAzfABPsjGvzWcc';
  
  const message = {
    text: `*New Issue Reported*\n\n*Agent:* ${agentName}\n*Transaction ID:* ${txId}\n*Description:* ${description}\n*Time:* ${new Date().toLocaleString()}`
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error('Failed to send report');
    }

    return await response.json();
  } catch (error) {
    console.error('Error reporting issue:', error);
    throw error;
  }
};
