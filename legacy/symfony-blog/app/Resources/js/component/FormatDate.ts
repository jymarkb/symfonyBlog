export const FormatDateTable = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short', // "Feb"
        day: '2-digit', // "28"
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true, // 12-hour format with AM/PM
        timeZone: 'Asia/Manila', // Ensures Manila timezone
    });
};


export const FormatDateCard = (dateString: string) =>{
    const date = new Date(dateString);
    return date.toLocaleString('en-PH', {
        year: 'numeric',
        month: 'short', // "Feb"
        day: '2-digit', // "28"
        timeZone: 'Asia/Manila', // Ensures Manila timezone
    });
}


