import { useState, useEffect } from "react";
import {TYPE_SPRITE_IDS, TYPE_BG, TYPE_COLORS} from '../utils/constants.js';

export default function PokedexCard({name, data, setSelectedPokemon, setPage}) {
    const [isHovered, setIsHovered] = useState(false);
    const pokedexNumber = `#${String(data.id).padStart(3, '0')}`;

    return (
        <div 
            onClick={()=> {
                setSelectedPokemon(name);
                setPage(`pokedex/${name}`)}}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style= {{
                position: 'relative',
                cursor: 'pointer', 
                textAlign: 'center', 
                background: isHovered ? TYPE_BG[data.types[0]] : 'var(--grey-800)',
                transition: 'background-color 0.3s ease, transform 0.2s ease',
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                boder: '10px red solid',
                border: `2px solid ${isHovered ? TYPE_COLORS[data.types[0]] : 'transparent'}`,
                padding: '10px', 
                borderRadius: '8px',
                fontFamily: 'inherit'
            }}
        >
            <span style={{
                position: 'absolute',
                top: '8px',
                right: '10px',
                fontSize: '10px',
                color: 'var(--grey-200)'
            }}>
                {pokedexNumber}
            </span>
            <img 
                src={data.sprite} 
                style={{ width: '100px', height: '100px', objectFit: 'contain'}}
            />
            <div>
                {data.types.map(type => {
                    const typeId = TYPE_SPRITE_IDS[type];
                    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-vi/x-y/${typeId}.png`;
                    return (
                        <img 
                            key={type} 
                            src={spriteUrl} 
                            alt={type}
                            style={{ 
                                height: '20px', 
                                marginRight: '6px',
                                imageRendering: 'pixelated', 
                                verticalAlign: 'middle',
                                marginBottom: '10px'
                                
                            }} 
                        />
                    )
                })}
            </div>
            <h3 style={{textTransform: 'capitalize', fontFamily: 'inherit'}}> {name} </h3>
        </div>
    )
}