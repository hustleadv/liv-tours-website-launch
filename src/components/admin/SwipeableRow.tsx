import { useState, ReactNode } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Trash2, Edit2 } from "lucide-react";

interface SwipeableRowProps {
  children: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  className?: string;
}

const SwipeableRow = ({ children, onDelete, onEdit, className = "" }: SwipeableRowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const x = useMotionValue(0);
  
  // Calculate opacity for action buttons based on swipe distance
  const actionsOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const actionsScale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.8]);
  
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = -60;
    
    if (info.offset.x < threshold) {
      // Swiped left enough - open actions
      setIsOpen(true);
    } else {
      // Not swiped enough or swiped right - close
      setIsOpen(false);
    }
  };

  const handleActionClick = (action: 'delete' | 'edit') => {
    if (action === 'delete' && onDelete) {
      onDelete();
    } else if (action === 'edit' && onEdit) {
      onEdit();
    }
    setIsOpen(false);
  };

  const closeActions = () => {
    setIsOpen(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Action buttons (revealed on swipe) */}
      <motion.div 
        className="absolute right-0 top-0 bottom-0 flex items-center gap-1 pr-2"
        style={{ opacity: isOpen ? 1 : actionsOpacity, scale: isOpen ? 1 : actionsScale }}
      >
        {onEdit && (
          <button
            onClick={() => handleActionClick('edit')}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 text-white shadow-lg active:scale-95 transition-transform"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => handleActionClick('delete')}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-destructive text-white shadow-lg active:scale-95 transition-transform"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </motion.div>

      {/* Main content (swipeable) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={{ x: isOpen ? -100 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
        style={{ x }}
        onClick={isOpen ? closeActions : undefined}
        className="relative bg-background touch-pan-y cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeableRow;
