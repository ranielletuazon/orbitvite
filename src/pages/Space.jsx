import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { auth, db } from '../firebase/firebase.jsx'; 
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import styles from './Space.module.css'; 

import HeaderPage from './HeaderPage.jsx';
import SidebarPage from './SidebarPage.jsx';

function Space({ user }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [games, setGames] = useState([]); // List of games from Firestore
    const [searchTerm, setSearchTerm] = useState(''); // Search input state
    const [filteredGames, setFilteredGames] = useState([]); // Filtered games based on search term
    const [selectedGame, setSelectedGame] = useState(null); // State to hold the selected game
    const [showSearchResults, setShowSearchResults] = useState(false); // State to control visibility of search results
    const searchRef = useRef(null); // Reference for the search box container

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        setUserData(userDocSnap.data());
                    } else {
                        console.log('No such document!');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };

        fetchUserData();
    }, [user]);

    // Fetch all games from Firestore
    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesCollection = collection(db, 'onlineGames');
                const gamesSnapshot = await getDocs(gamesCollection);
                const gamesList = gamesSnapshot.docs.map((doc) => ({
                    id: doc.id, // Document ID
                    title: doc.data().gameTitle, // Field for game title
                }));
                setGames(gamesList); // Set the games in state
            } catch (error) {
                console.error('Error fetching games:', error);
            }
        };

        fetchGames();
    }, []);

    // Handle search input change
    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchTerm(value);

        // Filter games based on search term
        const filtered = games.filter((game) =>
            game.title.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredGames(filtered);
        setShowSearchResults(value !== ''); // Show results if search term is not empty
    };

    // Handle game selection
    const handleGameSelect = (game) => {
        setSelectedGame(game); // Set the selected game
        setSearchTerm(game.title); // Update the search term to show the selected game
        setFilteredGames([]); // Clear filtered games to close the selection box
        setShowSearchResults(false); // Hide search results
        console.log('Selected game:', game); // Log the selected game
    };

    // Handle clicks outside the search box
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setShowSearchResults(false); // Hide search results when clicking outside
        }
    };

    // Use effect to add/remove event listener for clicks outside
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <div className={styles.spacePage}> 
                <HeaderPage user={user} />
                <div className={styles.contentPage}>
                    <div className='welcomeHolder' style={{ marginBottom: '1.2rem' }}>
                        <span className="welcomeText" style={{ color: 'white', fontSize: '1.5rem'}}>
                            Welcome back,{' '}
                            <span style={{ color: '#2cc6ff' }}>
                                {user && userData ? userData.username : ''}
                            </span>
                            !
                        </span>
                    </div>
                    
                    {/* Game search section */}
                    <div className='gameSearcher'>
                        <span className="cardText" style={{ color: 'white', fontSize: '1.5rem'}}>FIND A TEAMMATE!</span>
                    </div>
                    <div style={{ display: 'flex', marginBottom: '2rem', alignItems: 'center', position: 'relative' }}>
                        <div className={styles.searchSection} ref={searchRef}>
                            <input 
                                className={styles.chooseMultiplayerGame} 
                                type="text" 
                                value={searchTerm} 
                                onChange={handleSearchChange} 
                                placeholder="Search games..."
                                onFocus={() => setShowSearchResults(true)} // Show results when focused
                            />
                            {/* Displaying search results */}
                            {showSearchResults && searchTerm && (
                                <div className={styles.disappearingBlock}>
                                    {filteredGames.length > 0 ? (
                                        filteredGames.map((game) => (
                                            <div 
                                                key={game.id} 
                                                className={styles.searchGamesBox} 
                                                onClick={() => handleGameSelect(game)} // Handle game selection
                                            >
                                                {game.title}
                                            </div>
                                        ))
                                    ) : (
                                        <div className={styles.searchGamesBox}>
                                            No games found.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={styles.gameButton}>
                            <span>Search</span>
                        </div>
                    </div>

                    <div className={styles.popularGameTab } style={{ color: 'white', fontSize: '1.5rem', marginBottom:'2rem'}}>
                        <span>Popular Games</span>
                        <div className={styles.popularGamesHolder}>
                            <div className={styles.popularGamesBox} style={{marginRight: '1rem'}}></div>
                            <div className={styles.popularGamesBox}></div>
                        </div>
                    </div>
                </div>
                <SidebarPage />
            </div>
        </>
    );
}

export default Space;
