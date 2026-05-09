import { BlockEditor } from '@jymarkb/block-editor';

export default function Pages() {
    const onChange = (value: any[]) => {
        console.log("Document changed:", value);
    }

    const onUpload = async (file: File) => {
        console.log("Uploading file:", file);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return URL.createObjectURL(file);
    }

    return (
        <BlockEditor onChange={onChange} onUpload={onUpload} initialValue={[]}/>
    )
}
