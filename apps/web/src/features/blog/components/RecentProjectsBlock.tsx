export function RecentProjectsBlock() {
  return (
    <div className="side-block">
      <h4>
        <span>Recent projects</span>
        <a href="#">all →</a>
      </h4>

      <div className="proj-list">
        <div className="proj">
          <div className="proj-head">
            <span className="proj-name">prompt-trace</span>
            <span className="proj-status live">Live</span>
          </div>
          <p className="proj-desc">
            A logger for LLM prompt assembly. Open source, 2.4k stars.
          </p>
        </div>

        <div className="proj">
          <div className="proj-head">
            <span className="proj-name">small-cli</span>
            <span className="proj-status beta">Beta</span>
          </div>
          <p className="proj-desc">
            A toolkit for writing pleasant terminal apps in Go.
          </p>
        </div>

        <div className="proj">
          <div className="proj-head">
            <span className="proj-name">letter-count</span>
            <span className="proj-status wip">WIP</span>
          </div>
          <p className="proj-desc">
            A daily journaling app for people who hate journaling apps.
          </p>
        </div>
      </div>
    </div>
  );
}
