import React, { useState } from 'react';
export const Filters = ({
  dataFilter,
  onFilterChange, 
}: {
  dataFilter: Record<string, string[]>;
  onFilterChange: (
    updatedFilter: Record<string, Record<string, number> | string>,
  ) => void;
}) => {
  const [filter, setFilter] = useState<Record<string, Record<string, number>>>(
    Object.entries(dataFilter).reduce(
      (acc, [key, value]) => {
        acc[key] = value.reduce(
          (subAcc, item) => {
            subAcc[item] = 0;
            return subAcc;
          },
          {} as Record<string, number>,
        );
        return acc;
      },
      {} as Record<string, Record<string, number>>,
    ),
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dataFilter = e.target.getAttribute('data-filter') as string;
    console.log(e.target.value);
    
    const updateFilter = {
      ...filter,
      [dataFilter]: {
        ...filter[dataFilter],
        [e.target.id]: e.target.checked ? 1 : 0,
      },
    };

    setFilter(updateFilter);
    onFilterChange(updateFilter);
  };

  return (
    <div>
      {Object.entries(filter).map(([key, value]) => (
        <div key={key}>
          <div>{key.charAt(0).toUpperCase() + key.slice(1)}</div>
          <ul className="flex gap-1 flex-col mb-5">
            {Object.entries(value).map(([option, count]) => (
              <li key={option}>
                <label
                  htmlFor={option}
                  className="flex items-center gap-2 cursor-pointer text-gray-600 transition-colors hover:text-blue-500"
                >
                  <input
                    type="checkbox"
                    id={option}
                    value={count + 1}
                    className="peer hidden"
                    onChange={handleChange}
                    data-filter={key}
                  />
                  <div className="h-5 w-5 flex items-center justify-center border-2 border-gray-400 rounded-md transition-all peer-checked:bg-blue-500 peer-checked:border-blue-500">
                    <i className="icon-check text-white scale-75 transition-all duration-200"></i>
                  </div>
                  <span className="peer-checked:font-medium">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
