import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  color?: 'primary' | 'white';
  onLeftIconClick?: () => void;
  onRightIconClick?: () => void;
}

export default function Header({
  title,
  leftIcon,
  rightIcon,
  color = 'white',
  onLeftIconClick,
  onRightIconClick
}: HeaderProps) {
  const bgColor = color === 'primary' ? 'bg-primary' : 'bg-white';
  const textColor = color === 'primary' ? 'text-white' : 'text-darkGray';
  
  return (
    <header className={`${bgColor} px-4 py-3 flex items-center justify-between shadow-sm`}>
      {leftIcon ? (
        <div onClick={onLeftIconClick} className="cursor-pointer">
          {leftIcon}
        </div>
      ) : (
        <div className="flex items-center">
          <span className="material-icons text-primary mr-2">local_hospital</span>
          <h1 className={`text-xl font-bold ${textColor}`}>{title}</h1>
        </div>
      )}
      
      {rightIcon && (
        <div onClick={onRightIconClick} className="cursor-pointer">
          {rightIcon}
        </div>
      )}
    </header>
  );
}
