import React from 'react';
import { FeaturedBlog } from '../../dashboard/utils/props';
import { FormatDateCard } from '../../component/FormatDate';

const FeaturedCard = ({ data }: { data: FeaturedBlog[] }) => {
  const icons = ['icon-newspaper', 'icon-rss', 'icon-book-text'];
  const formatViews = (views: number) => {
    const totalViews = parseFloat((views / 1000).toFixed(1));
    return totalViews + 'K';
  };

  return (
    <>
      {data.map((item, index) => {
        return (
          <a key={index} href={`blog/${item.slug}`} className="featureCard-animate flex justify-center">
          <div className={`${item.name} card card-post w-full max-w-[330px] h-[370px] 2xl:h-fit 2xl:w-full 2xl:max-w-full border rounded xl:rounded-lg shadow transition duration-300 hover:scale-105`}>
            <div className="flex 2xl:flex-row flex-col h-full">
              <div className="left w-full 2xl:w-[65%] 2xl:my-4 mb-4 2xl:order-1 order-2 flex flex-col h-full">
                <div className="flex h-fit items-center">
                  <div className="badge mr-2 2xl:px-4 2xl:py-2 py-1 px-2 text-sm h-fit">
                  <i className={icons[item.category_id-1]}></i>&nbsp;
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </div>

                  <div className="border-l pl-2 flex gap-2 items-center">
                    <span className="h-8 w-8 lg:h-10 lg:w-10 shrink-0 overflow-hidden rounded-full bg-primaryTheme-600 border-primaryTheme border-1">
                      <img className="aspect-square object-cover" src={`img/user/${item.avatar}`} alt="avatar image"/>
                    </span>
                    <p className="name">  {item.firstName.charAt(0).toUpperCase() +
                        item.firstName.slice(1) +
                        ' ' +
                        item.lastName.charAt(0).toUpperCase() +
                        '.'}</p>
                  </div>
                </div>

                <div className="mx-4 my-2 2xl:mr-2 flex flex-col gap-2 mt-auto 2xl:mt-none">
                  <p className="font-semibold text-foreground title text-md text-justify h-12 line-clamp-2">{item.title}</p> 
                  <div className="text-xs md:text-sm date flex items-center justify-between gap-1 2xl:gap-1">
                  <span>{FormatDateCard(item.created_at.date)}</span>
                    <div className="bg-border h-4 w-[1px]"></div>
                    <span className="italic flex items-center"> <i className="icon-clock mr-1"></i>
                    {item.readingTime} min read</span>
                    <div className="bg-border h-4 w-[1px]"></div>
                    <span className="flex items-center"><i className="icon-eye mr-1"></i>
                    {formatViews(item.views)} Views</span>
                  </div>

                </div>
              </div>
              <div className="right w-full 2xl:w-[35%] 2xl:p-4 2xl:pl-0 p-4 pb-2 flex 2xl:justify-end justfiy-center 2xl:order-2 order-1">
                <img className="rounded-md 2xl:rounded-xl 2xl:w-[120px] 2xl:h-[120px] w-full h-[205px] aspect-square object-cover"
                width="120" height="120"  src={`img/blog/thumbnails/${item.htmlThumbnail}`} alt="most popular image thumbnail"/>
              </div>
            </div>
          </div>
        </a>
        );
      })}
    </>
  );
};

export default FeaturedCard;
