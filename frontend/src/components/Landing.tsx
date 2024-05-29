import { useEffect } from 'react';

// Landing view
const Landing = ({ setCurrentView }: { setCurrentView: any }) => {
    useEffect(() => {
        setCurrentView('/');
    }, []);

    return (
        <div className="slogan">Elevating Tomorrow's Ideas</div>
    );
}
  
export default Landing