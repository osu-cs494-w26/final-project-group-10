import { TYPE_BG, TYPE_COLORS } from '../utils/constants.js';
import { useState } from 'react';

export default function PokedexInfo({ pokemon }) {
    if (!pokemon) return null;

    const [userHeight, setUserHeight] = useState(173);
    if (!pokemon) return null;

    const pokemonHeightM = pokemon.height / 10;
    const userHeightM = userHeight ? userHeight / 100 : null;
    const maxHeight = Math.max(pokemonHeightM, userHeightM || 0, 0.1);

    const CONTAINER_HEIGHT = 140;
    const pokemonPx = Math.round((pokemonHeightM / maxHeight) * CONTAINER_HEIGHT);
    const userPx = userHeightM ? Math.round((userHeightM / maxHeight) * CONTAINER_HEIGHT) : null;

    const getGroundingShift = (height) => {
        if (height < 0.8) return '15%';
        if (height <= 2.0) return '6%'; 
        return '2%';                    
    };

    const shiftValue = getGroundingShift(pokemonHeightM);

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
                                transform: `translateY(${shiftValue})`,
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
                    <span style={{ color: '#888', fontSize: '11px', fontFamily: 'monospace' }}>YOUR HT (CM):</span>
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
                        style={{ background: '#333', border: '1px solid #444', color: 'white', width: '60px', fontSize: '11px', padding: '2px 4px' }}
                    />
                </div>
            </div>
        </div>
    );
}