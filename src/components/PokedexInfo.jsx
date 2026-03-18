import { TYPE_BG, TYPE_COLORS } from '../utils/constants.js';
import { fetchPokeData } from '../hooks/usePokemonData.js';
import { useState, useEffect, Fragment} from 'react';

const evoCache = {};

function flattenChain(node, result = []) {
    result.push(node.species.name);
    node.evolves_to.forEach(next => flattenChain(next, result));
    return result;
}

function useEvolutionChain(pokemonName) {
    const [chain, setChain] = useState(null); 
 
    useEffect(() => {
        if (!pokemonName) return;
        let cancelled = false;
 
        async function load() {
            const baseName = pokemonName
                .replace(/-incarnate$/, '').replace(/-aria$/, '')
                .replace(/-ordinary$/, '').replace(/-male$/, '')
                .replace(/-standard$/, '').replace(/-red-striped$/, '')
                .replace(/-altered$/, '').replace(/-plant$/, '')
                .replace(/-normal$/, '').replace(/-land$/, '');
 
            if (evoCache[baseName]) {
                setChain(evoCache[baseName]);
                return;
            }

            try {
                const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${baseName}`);
                const speciesData = await speciesRes.json();
                const chainUrl = speciesData.evolution_chain?.url;
                if (!chainUrl) return;
 
                const chainRes = await fetch(chainUrl);
                const chainData = await chainRes.json();
                const names = flattenChain(chainData.chain);
 
                const members = await Promise.all(names.map( async(n) => {
                    try {
                        const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${n}`);
                        const pokeData = await pokeRes.json(); 
                        const suffixName = pokeData.varieties.find(v => v.is_default)?.pokemon.name;
                        const memberData = await fetchPokeData(suffixName);

                        return {
                            speciesName: n, 
                            name: memberData.name, 
                            sprite: memberData.sprite,
                            id: memberData.id 
                        };
                    }   catch (err) {
                        console.error(`Failed to fetch member in const members ${n}:`, err);
                        return null;
                    } 
                }));
                const result = members.filter(m => m !== null);
 
                evoCache[baseName] = result;
                if (!cancelled) setChain(result);
            } catch (e) {
                console.error('Evolution chain fetch failed', e);
                if (!cancelled) setChain([]);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [pokemonName]);
 
    return chain;
}

export default function PokedexInfo({ pokemon, setSelectedPokemon, setPage }) {
    if (!pokemon) return null;

    const [userHeight, setUserHeight] = useState(140);

    const pokemonHeightM = pokemon.height / 10;
    const userHeightM = userHeight ? userHeight / 100 : null;
    const maxHeight = Math.max(pokemonHeightM, userHeightM || 0, 0.1);

    const CONTAINER_HEIGHT = 140;
    const pokemonPx = Math.round((pokemonHeightM / maxHeight) * CONTAINER_HEIGHT);
    const userPx = userHeightM ? Math.round((userHeightM / maxHeight) * CONTAINER_HEIGHT) : null;

    const evoChain = useEvolutionChain(pokemon.name);

    return (
        <div style={{
            marginTop: '24px',
            width: '580px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
        }}>
            {/* Base stats prt */}
            <div style={{
                background: 'var(--grey-800)',
                border: '3px solid black',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '6px 6px 0 black',
            }}>
                <h3 style={{
                    color: '#cc2233',
                    fontFamily: 'monospace',
                    margin: '0 0 16px',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}>
                    Base Stats
                </h3>
                {pokemon.stats.map(stat => (
                    <div key={stat.name} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{
                                fontSize: '11px',
                                color: '#ffffff',
                                fontFamily: 'monospace',
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                            }}>
                                {stat.name}
                            </span>
                            <span style={{ fontSize: '11px', color: 'white', fontFamily: 'monospace' }}>
                                {stat.value}
                            </span>
                        </div>
                        <div style={{ background: '#333', borderRadius: '2px', height: '6px' }}>
                            <div style={{
                                background: stat.value >= 100 ? '#7dffb0' : stat.value >= 60 ? '#ffcc00' : '#ff4444',
                                borderRadius: '2px',
                                height: '100%',
                                width: `${Math.min((stat.value / 255) * 100, 100)}%`,
                                transition: 'width 0.4s ease',
                            }}/>
                        </div>
                    </div>
                ))}
            </div>

            {/* Abilities part */}
            <div style={{
                background: 'var(--grey-800)',
                border: '3px solid black',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '6px 6px 0 black',
            }}>
                <h3 style={{
                    color: '#cc2233',
                    fontFamily: 'monospace',
                    margin: '0 0 16px',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}>
                    Abilities
                </h3>
                {pokemon.abilities.map(ability => (
                    <div key={ability.name} style={{
                        marginBottom: '12px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #333',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                                fontSize: '12px',
                                textTransform: 'capitalize',
                                color: 'white',
                                fontFamily: 'monospace',
                            }}>
                                {ability.name}
                            </span>
                            {ability.isHidden && (
                                <span style={{
                                    fontSize: '9px',
                                    color: '#ffcc00',
                                    fontFamily: 'monospace',
                                    border: '1px solid #ffcc00',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    textTransform: 'uppercase',
                                }}>
                                    hidden
                                </span>
                            )}
                        </div>
                        {ability.desc && (
                            <p style={{
                                fontSize: '11px',
                                color: '#888',
                                fontFamily: 'monospace',
                                margin: 0,
                                lineHeight: 1.6,
                            }}>
                                {ability.desc}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Evolution chain */}
            <div style={{
                background: 'var(--grey-800)',
                border: '3px solid black',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '6px 6px 0 black',
            }}>
                <h3 style={{
                    color: '#cc2233',
                    fontFamily: 'monospace',
                    margin: '0 0 16px',
                    fontSize: '14px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}>
                    Evolution Chain
                </h3>
 
                {!evoChain ? (
                    <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px', margin: 0 }}>Loading...</p>
                ) : (evoChain.length === 0 || evoChain.length === 1) ? (
                    <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '11px', margin: 0 }}>This Pokémon does not evolve.</p>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', justifyContent: 'center'}}>
                        {evoChain.map((member, i) => (
                            <Fragment key={member.name}>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPokemon(member.name)
                                        setPage(`pokedex/${member.name}`)
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: member.name === pokemon.name ? `2px solid ${TYPE_COLORS[pokemon.types[0]]}`: '1px solid var(--grey-500)',
                                        background: member.name === pokemon.name ? TYPE_BG[pokemon.types[0]] : 'transparent',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={e => {
                                        if (member.name !== pokemon.name) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    }}
                                    onMouseLeave={e => {
                                        if (member.name !== pokemon.name) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <img
                                        src={member.sprite}
                                        alt={member.name}
                                        style={{ width: '72px', height: '72px', objectFit: 'contain', imageRendering: 'pixelated' }}
                                    />
                                    <span style={{
                                        fontSize: '10px',
                                        color: 'white',
                                        fontFamily: 'monospace',
                                        textTransform: 'capitalize',
                                        marginTop: '4px',
                                    }}>
                                        {member.name}
                                    </span>
                                    <span style={{ fontSize: '9px', color: 'var(--grey-300)', fontFamily: 'monospace' }}>
                                        #{String(member.id).padStart(3, '0')}
                                    </span>
                                </div>
                                {(i < evoChain.length -1) && <p key={member.name+i}> → </p>}
                            </Fragment>
                        ))}
                    </div>
                )}
            </div>

            {/* Height check part */}
            <div style={{
                background: 'var(--grey-800)',
                border: '3px solid black',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '6px 6px 0 black',
            }}>
                <h3 style={{ 
                    color:'#cc2233', 
                    fontFamily: 'monospace', 
                    margin: '0 0 16px', 
                    fontSize: '14px', 
                    textTransform: 'uppercase' }}>
                    Height Check
                </h3>
                
                <div style={{ 
                    height: '180px', 
                    background: 'white', 
                    backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px)', 
                    backgroundSize: '100% 20px',
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    justifyContent: 'space-around',
                    padding: '10px',
                    border: '2px solid black',
                    borderRadius: '4px',
                    position: 'relative'
                }}>
                    {/* Pokemon */}
                    <div style={{ textAlign: 'center' }}>
                        <img 
                            src={pokemon.sprite} 
                            style={{ 
                                height: `${pokemonPx}px`, 
                                filter: 'brightness(0)', 
                                imageRendering: 'pixelated',
                            }} 
                        />
                        <div style={{ color: 'black', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '4px' }}>
                            {pokemonHeightM}m
                        </div>
                    </div>

                    {/* Trainer */}
                    <div style={{ textAlign: 'center' }}>
                        <img 
                            src="https://play.pokemonshowdown.com/sprites/trainers/red.png" 
                            style={{ 
                                height: `${userPx}px`, 
                                filter: 'brightness(0)', 
                                imageRendering: 'pixelated',
                            }} 
                        />
                        <div style={{ color: 'black', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace', marginTop: '4px' }}>
                            {Math.round(userHeightM * 100)/100}m
                        </div>
                    </div>
                </div>

                {/* Input height*/}
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'white', fontSize: '11px', fontFamily: 'monospace' }}>ENTER HT (CM):</span>
                    <input 
                        type="number" 
                        value={userHeight} 
                        min="1"
                        step="1"
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || parseInt(val) > 0) {
                                setUserHeight(val);
                            }
                        }}
                        style={{ 
                            border: '2px solid var(--grey-500)',
                            background: 'var(--grey-800)', 
                            color: 'white', 
                            width: '60px', 
                            fontSize: '11px', 
                            padding: '2px 4px' 
                        }}
                    />
                </div>
            </div>
        </div>
    );
}