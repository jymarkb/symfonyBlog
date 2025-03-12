export const fetchPreview = async (data: Record<string, any>): Promise<string> => {
    try {
      const response = await fetch('/dashboard/pages/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      return response.text();
    } catch (error) {
      console.error('Failed to fetch preview:', error);
      return '';
    }
  };
  