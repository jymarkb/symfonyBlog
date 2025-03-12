import React from 'react';
import { useEffect, useState } from 'react';
import { fetchData } from './action/SearchBarAction';


const SearchFilter = async() => {
  const data = [
    {
      title: 'Status',
      items: ['drafted', 'published'],
    },
    {
      title: 'Category',
      items: ['article', 'news', 'information'],
    },
  ];

  const testFetch = await fetchData({value:'the', status:[], category:[]})
  console.log(testFetch);
  

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setStatus({
  //     ...status,
  //     drafted: 1,
  //   });
  //   console.log(`Checkbox ${e.target.id} changed:`, e.target.checked);
  // };

  return {
    openModal: true,
    data: (
      <div className="text-xl w-[350px] flex flex-col gap-2">
        {data.map((section, index) => (
          <div key={index} className="">
            <div className="font-semibold text-primaryTheme mb-2">
              {section.title}
            </div>
            <ul className="flex gap-1 flex-col mb-5">
              {section.items.map((item, key) => (
                <li key={item} className="w-[120px] ml-4">
                  <label
                    htmlFor={item}
                    className="flex items-center gap-2 cursor-pointer text-gray-600 transition-colors hover:text-blue-500"
                  >
                    <input
                      type="checkbox"
                      id={item}
                      value={key + 1}
                      className="peer hidden"
                      // onChange={handleChange}
                    />
                    <div className="h-5 w-5 flex items-center justify-center border-2 border-gray-400 rounded-md transition-all peer-checked:bg-blue-500 peer-checked:border-blue-500">
                      <i className="icon-check text-white scale-75 transition-all duration-200"></i>
                    </div>
                    <span className="peer-checked:font-medium">
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button className="bg-primaryTheme hover:bg-primaryTheme-900 duration-500 transition px-4 py-2 mt-2 text-white rounded-md ">
          Apply
        </button>
      </div>
    ),
  };
};

export default SearchFilter;
