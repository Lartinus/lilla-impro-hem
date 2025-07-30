interface ShowTagProps {
  name: string;
  color?: string;
  size?: 'small' | 'large';
  clickable?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

// Map tag names to CSS variables
const getTagColor = (name: string): string => {
  switch (name.toLowerCase()) {
    case 'ensemble':
      return 'rgb(var(--primary-red))'; // #DC2626
    case 'house team':
      return 'rgb(var(--action-blue))'; // #2563EB
    case 'kursuppspel':
      return 'rgb(var(--course-tag-gray))'; // #44403C
    case 'gästspel':
      return 'rgb(var(--guest-blue-gray))'; // #1F2937
    default:
      return '#666666';
  }
};

export default function ShowTag({ name, color, size = 'small', clickable = false, isSelected = false, onClick }: ShowTagProps) {
  const tagColor = getTagColor(name);
  const sizeClasses = size === 'large' 
    ? 'w-[115px] h-[28px] text-[16px]' 
    : 'w-[80px] h-[22px] text-[12px]';

  const Component = clickable ? 'button' : 'div';
  
  return (
    <Component 
      className={`${sizeClasses} rounded-full border-2 flex items-center justify-center font-rajdhani font-medium ${
        clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
      style={isSelected ? { 
        color: tagColor,
        backgroundColor: 'transparent',
        borderColor: tagColor
      } : { 
        color: 'rgb(var(--white))',
        backgroundColor: tagColor,
        borderColor: tagColor
      }}
      onClick={clickable ? onClick : undefined}
    >
      {name}
    </Component>
  );
}