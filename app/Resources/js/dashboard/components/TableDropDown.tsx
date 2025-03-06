import { useEffect, useState } from 'react';
import { TableDropDownProps } from '../utils/props';
const TableDropDown: React.FC<TableDropDownProps> = ({
  targetX = 0,
  targetY = 0 ,
  isVisible = false,
  children = null,
}) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setIsRendered(true), 10);
    } else {
      setIsRendered(false);
    }
  }, [isVisible]);

  return (
    <div
      className={`dropdown-container rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${isRendered ? 'visible' : ''}`}
      style={{
        position: 'fixed',
        top: targetY - 30,
        left: targetX - 155,
        height: 'auto',
        width: '150px',
        zIndex: 30,
      }}
    >
      {children}
    </div>
  );
};

export default TableDropDown;
