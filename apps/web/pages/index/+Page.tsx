import { useData } from "vike-react/useData";
import type { HomePageData } from "@/features/blog/blogTypes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppShell } from "@/layouts/AppShell";
import { HeroSection } from "@/features/blog/components/HeroSection";
import { FeaturedPostsSection } from "@/features/blog/components/FeaturedPostsSection";
import { LatestPostsSection } from "@/features/blog/components/LatestPostsSection";
import { AboutCard } from "@/features/blog/components/AboutCard";
import { CurrentlyReadingBlock } from "@/features/blog/components/CurrentlyReadingBlock";
import { ListeningNowBlock } from "@/features/blog/components/ListeningNowBlock";
import { RecentProjectsBlock } from "@/features/blog/components/RecentProjectsBlock";
import { TagsSection } from "@/features/blog/components/TagsSection";

export default function Page() {
  const data = useData<HomePageData>();
  return (
    <AppShell>
      <ErrorBoundary>
        <HeroSection total={data.totalPosts} />
        <div className="shell blog-main">
          <div>
            <FeaturedPostsSection initialPosts={data.featuredPosts} />
            <LatestPostsSection initialPosts={data.latestPosts} total={data.totalPosts} />
          </div>
          <aside className="sidebar">
            <AboutCard />
            <ListeningNowBlock />
            <CurrentlyReadingBlock />
            <RecentProjectsBlock />
            <TagsSection tags={data.tags} />
          </aside>
        </div>
      </ErrorBoundary>
    </AppShell>
  );
}
