import { useState, useEffect } from 'react';
const detailsCache = {};

function usePokedexDetails(selectedPokemon) {
    const [details, setDetails] = useState({ description: 'Loading...', category: '' });

    useEffect(() => {
        if (!selectedPokemon?.name) return;

        const baseName = selectedPokemon.name
        .replace(/-incarnate$/, '')
        .replace(/-aria$/, '')
        .replace(/-ordinary$/, '')
        .replace(/-male$/, '')
        .replace(/-standard$/, '')
        .replace(/-red-striped$/, '')
        .replace(/-altered$/, '')
        .replace(/-plant$/, '')
        .replace(/-normal$/, '')
        .replace(/-land$/, '');

        if (detailsCache[baseName]) {
            setDetails(detailsCache[baseName]);
            return;
        }

        fetch(`https://pokeapi.co/api/v2/pokemon-species/${baseName}`)
            .then(r => r.json())
            .then(data => {
                const entry = data.flavor_text_entries?.find(e => e.language.name === 'en');
                const genusEntry = data.genera?.find(g => g.language.name === 'en');
                const result = {
                    description: entry ? entry.flavor_text.replace(/\f/g, ' ') : 'No data.',
                    category: genusEntry ? genusEntry.genus : 'Unknown'
                };
                detailsCache[baseName] = result;
                setDetails(result);
            })
            .catch(() => setDetails({ description: 'No Pokédex entry available.', category: '' }));
    }, [selectedPokemon?.name]);

    return details;
}

export default function Pokedex({ selectedPokemon,setSelectedPokemon,setPage }) {
    const { description, category } = usePokedexDetails(selectedPokemon);
    const [playing, setPlaying] = useState(false);

    const playCry = () => {
        if (playing) return;
        const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${selectedPokemon?.id}.ogg`);
        setPlaying(true);
        audio.volume = 0.05;
        audio.play();
        audio.onended = () => setPlaying(false);
    };

    return (
        <div 
            onClick={(e) => e.stopPropagation()}
            style={{
                display: 'flex',
                border: '3px solid black',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '6px 6px 0 black',
                width: '580px',
        }}>

            {/* Left Panel */}
            <div style={{
                background: '#cc2233',
                width: '260px',
                flexShrink: 0,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>

                {/* Top lights and exit button */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button onClick={() => {
                        setPage('pokedex')
                        setSelectedPokemon(null)
                        }}
                        style={{ cursor: 'pointer', width: 14, height: 14, borderRadius: '50%', background: '#4488ff', border: '2px solid black' }}
                    />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4444', border: '1.5px solid black' }}/>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffcc00', border: '1.5px solid black' }}/>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#44cc44', border: '1.5px solid black' }}/>
                </div>

                {/* Screen */}
                <div style={{ background: '#c8c8c8', borderRadius: '8px', padding: '8px', border: '2px solid black' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#cc2233', border: '1px solid black' }}/>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#cc2233', border: '1px solid black' }}/>
                    </div>
                    <div style={{
                        background: 'var(--grey-800)',
                        borderRadius: '4px',
                        height: '150px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <img
                            src={selectedPokemon?.sprite}
                            alt={selectedPokemon?.name}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }}
                        />
                    </div>
                </div>

                
                {/* Name and cry button */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                    <div style={{
                        background: 'var(--grey-800)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        border: '2px solid black',
                        textAlign: 'center',
                        flex: 1,
                    }}>
                        <span style={{ color: '#ffffff', fontSize: '14px', textTransform: 'capitalize' }}>
                            {selectedPokemon?.name}
                        </span>
                    </div>
                    <button
                        onClick={playCry}
                        onMouseEnter={e => e.currentTarget.style.background='#0f2a1a'}
                        onMouseLeave={e => e.currentTarget.style.background='var(--grey-800)'}
                        style={{
                            background: playing ? '#0f2a1a' : 'var(--grey-800)',
                            border: '2px solid black',
                            borderRadius: '6px',
                            padding: '0 10px',
                            cursor: playing ? 'default' : 'pointer',
                            color: '#ffffff',
                            fontSize: '14px',
                            flexShrink: 0,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            fontFamily: 'inherit'
                        }}
                    >
                        {playing ? '▶  .  .  .' : '▶ Cry'}
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div style={{
                width: '18px',
                background: '#aa1122',
                borderLeft: '2px solid black',
                borderRight: '2px solid black',
                flexShrink: 0,
            }}/>

            {/* Right Panel */}
            <div style={{
                background: '#cc2233',
                flex: 1,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
            }}>

                {/* Description screen */}
                <div style={{
                    background: 'var(--grey-800)',
                    borderRadius: '6px',
                    padding: '12px',
                    border: '2px solid black',
                    flex: 1,
                }}>
                    <p style={{ color: '#ffffff', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                        {description}
                    </p>
                    <br/>
                    <p style={{ color: '#ffffff', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                        HEIGHT: {selectedPokemon?.height/10}m
                    </p>
                    <p style={{ color: '#ffffff', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
                        WEIGHT: {selectedPokemon?.weight}lbs
                    </p>
                </div>

                {/* Category and number */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{
                        background: 'var(--grey-800)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        border: '2px solid black',
                        flex: 1,
                        textAlign: 'center',
                    }}>
                        <span style={{ color: '#ffffff', fontSize: '12px', textTransform: 'capitalize' }}>
                            {category}
                        </span>
                    </div>
                    
                    <div style={{
                        background: 'var(--grey-800)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        border: '2px solid black',
                        textAlign: 'center',
                    }}>
                        <span style={{ color: '#ffffff', fontSize: '12px' }}>
                            #{String(selectedPokemon?.id ?? '').padStart(3, '0')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}