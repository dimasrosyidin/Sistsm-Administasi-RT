import { useEffect } from 'react';

export default function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} - Admin RT` : 'Admin RT';
  }, [title]);
}
