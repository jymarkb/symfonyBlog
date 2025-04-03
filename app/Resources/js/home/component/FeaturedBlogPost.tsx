import React from 'react';
import ReactDOM from 'react-dom/client';
import { FeaturedBlog, FeaturesBlogData } from '../../dashboard/utils/props';
import FeaturedCard from './FeaturedCard';

let cardRoot: ReactDOM.Root | null = null;

const FeaturedBlogPost = () => {
  const data: FeaturesBlogData = window.featuresBlog || {
    latest: {} as FeaturedBlog,
    most: {} as FeaturedBlog,
  };

  const btnWrapper = document.getElementById('blogPostBtnContainer');
  const cardContainer = document.getElementById('blogPostsContainer');

  if (!cardContainer) {
    return;
  }

  btnWrapper?.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLButtonElement;
    e.preventDefault();
    e.stopPropagation();

    console.log();

    const childButton = btnWrapper.querySelectorAll("button.blog-navigation");

    childButton.forEach((btn) => {
      const button = btn as HTMLButtonElement;
      button.disabled = false;
      button.classList.remove('active');
    });
    
    target.disabled = true;
    target.classList.toggle('active');

    const dataName = target.getAttribute('data-name') as string;

    if (!dataName || !(dataName in data)) {
      return;
    }

    if (!cardRoot) {
      cardRoot = ReactDOM.createRoot(cardContainer);
    }

    cardRoot.render(
      <FeaturedCard key={dataName} data={data[dataName as keyof FeaturesBlogData]}/>
    );
  });

};

export default FeaturedBlogPost;
