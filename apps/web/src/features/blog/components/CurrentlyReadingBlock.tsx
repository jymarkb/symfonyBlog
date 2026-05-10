export function CurrentlyReadingBlock() {
  return (
    <div className="side-block">
      <h4>
        <span>Currently reading</span>
        <a href="/now">all →</a>
      </h4>

      <div className="reading-list">
        <div className="read-item">
          <div className="read-cover book-1"></div>
          <div className="read-meta">
            <span className="title">Designing Data-Intensive Applications</span>
            <span className="author">Martin Kleppmann · re-read</span>
            <div className="read-progress">
              <i style={{ width: "62%" }}></i>
            </div>
          </div>
        </div>

        <div className="read-item">
          <div className="read-cover book-2"></div>
          <div className="read-meta">
            <span className="title">A Philosophy of Software Design</span>
            <span className="author">John Ousterhout</span>
            <div className="read-progress">
              <i style={{ width: "34%" }}></i>
            </div>
          </div>
        </div>

        <div className="read-item">
          <div className="read-cover book-3"></div>
          <div className="read-meta">
            <span className="title">The Wager</span>
            <span className="author">David Grann · fiction</span>
            <div className="read-progress">
              <i style={{ width: "88%" }}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
