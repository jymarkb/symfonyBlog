import { FiltersType } from "../../utils/props"
export const SearchFilterAction = async ({ filters }: { filters: FiltersType }) => {
    const templateFilter = {
        status: ['drafted', 'published'],
        category: ['article', 'news', 'information']
    };

    const format = Object.entries(filters).reduce((acc, [key, value]) => {
        acc[key] = Object.entries(value)
            .filter(([, v]) => v === 1)
            .map(([subKey]) => 
                templateFilter[key as keyof typeof templateFilter].indexOf(subKey) + 1 // Get index +1 for both
            );

        return acc;
    }, {} as Record<string, (string | number)[]>);


    const params = {
        title: filters.title ?? '',
        filter: format
    }

    const response = await fetch(`/blog/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });

    const data = await response.json();

    return data;

}