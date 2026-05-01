import React from 'react';
import { useEffect, useState } from 'react';
import { BlogPost } from '../../utils/props';
import { FormatDateTable } from '../../../component/FormatDate';

export const TableRows = ({ fetchData }: { fetchData: BlogPost[] }) => {
  const icons = ['icon-newspaper', 'icon-rss', 'icon-book-text'];
  const status = ['Drafted', 'Published'];

  const [renderedRows, setRenderedRows] = useState<BlogPost[]>([]);

  useEffect(() => {
    setRenderedRows(fetchData);
  }, [fetchData]);

  return (
    <>
      {renderedRows.length ? (
        renderedRows.map((item, index) => (
          <tr key={index}
            className={`${item.name} border-b transition-colors hover:bg-secondaryTheme/5 data-[state=selected]:bg-muted tr-animate`}
          >
            <td className="p-2 align-middle whitespace-nowrap">
              <div
                className={`flex p-1 px-2  ${item.status === 1 ? 'bg-gray-500 ' : 'bg-primaryTheme'} rounded text-white w-fit gap-1 text-xs sm:text-sm`}
              >
                <i
                  className={`${item.status === 1 ? 'icon-cog' : 'icon-check'}`}
                ></i>
                <span className="ml-auto">{status[item.status - 1]}</span>
              </div>
            </td>
            <td className="p-2 align-middle w-auto lg:max-w-[40%] xl:max-w-[45%] text-xs sm:text-sm whitespace-normal">
              {item.title}
            </td>
            <td className="p-2 align-middle hidden sm:table-cell whitespace-nowrap">
              <div className="badge inline-flex items-center rounded px-2 py-1 shadow text-sm h-fit gap-1 text-xs sm:text-sm">
                <i className={`h-fit ${icons[item.category_id - 1]}`}></i>
                <span>
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </span>
              </div>
            </td>
            <td className="p-2 align-middle hidden md:table-cell whitespace-nowrap">
              {item.firstName.charAt(0).toUpperCase() +
                item.firstName.slice(1) +
                ' ' +
                item.lastName.charAt(0).toUpperCase() +
                '.'}
            </td>
            <td className="p-2 align-middle hidden lg:table-cell whitespace-nowrap">
              {FormatDateTable(item.created_at.date)}
            </td>
            <td className="p-2 align-middle hidden xl:table-cell whitespace-nowrap">
              {FormatDateTable(item.updated_at.date)}
            </td>
            <td className="p-2 align-middle whitespace-nowrap">
              <button
                id={`${item.blog_id}`}
                className="btn-tableAction inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none hover:bg-primaryTheme-100 hover:text-accent-foreground h-8 w-8 p-0"
                data-dropdown="true"
                type="button"
                data-id={item.blog_id}
                data-slug={item.slug}
                data-title={item.title}
                aria-haspopup="menu"
                aria-expanded="false"
                data-uri={item.blog_id}
              >
                <i className="icon-ellipsis"></i>
              </button>
              <div
                id={`dropdown-${item.blog_id}`}
                className="dropdown-wrapper opacity-0"
              ></div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={7}
            className="text-center text-xl md:text-3xl lg:text-5xl font-semibold text-gray-500 h-[300px] md:h-[400px] lg:h-[450px]"
          >
            No records available...
          </td>
        </tr>
      )}
    </>
  );
};
