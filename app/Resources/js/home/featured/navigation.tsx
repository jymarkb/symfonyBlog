import React from "react";

export class FeaturedNavigation extends React.Component {
  blogNav: NodeListOf<Element>;

  constructor(props: any) {
    super(props);
    this.blogNav = document.querySelectorAll(".blog-navigation");
  }

  componentDidMound() {
    console.log("herrrrreee");
    console.log(this.blogNav);
  }

  render(): React.ReactNode {
    return null;
  }
}
