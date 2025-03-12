import { SearchFilterProps } from '../../utils/props';
export const fetchData = async ({
  value,
  status = [],
  category = [],
}: SearchFilterProps) => {
  if (!value.trim()) return;
  try {
    const searchData = {
      title: value,
      filter: {
        status: status,
        category: category,
      },
    };

    console.log(searchData);

    const response = await fetch(`/blog/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData),
    });

    const data = await response.json();

    console.log(data);

    return data;
  } catch (error) {
    console.error('Error fetching search results:', error);
  }
};

export const debounce = (func: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};
