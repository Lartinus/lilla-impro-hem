interface ShowTagProps {
  name: string;
  color?: string;
  size?: 'small' | 'large';
}

export default function ShowTag({ name, color = '#666666', size = 'small' }: ShowTagProps) {
  const sizeClasses = size === 'large' 
    ? 'w-[115px] h-[28px] text-[16px]' 
    : 'w-[80px] h-[22px] text-[12px]';

  return (
    <div 
      className={`${sizeClasses} rounded-full border-2 flex items-center justify-center font-rajdhani font-medium text-white`}
      style={{ 
        backgroundColor: color,
        borderColor: color
      }}
    >
      {name}
    </div>
  );
}