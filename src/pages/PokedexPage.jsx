import { useEffect, useState, useRef } from "react"
import { GEN1_POKEMON, GEN2_POKEMON, GEN3_POKEMON, GEN4_POKEMON, GEN5_POKEMON, TYPE_COLORS, TYPE_BG } from '../utils/constants.js';
import { usePokemonData } from "../hooks/usePokemonData";
import PokedexCard from "../components/PokedexCard.jsx";
import Pokedex from "../components/Pokedex.jsx";
import PokedexInfo from "../components/PokedexInfo.jsx";

const ALL_TYPES = [
    'normal','fire','water','electric','grass','ice',
    'fighting','poison','ground','flying','psychic',
    'bug','rock','ghost','dragon','dark','steel','fairy'
];

function SkeletonCard() {
    return (
        <div style={{
            background:'var(--grey-900)',
            padding: '10px',
            borderRadius: '8px',
            height: '180px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            <div style={{ width: '80px', height: '80px', background: 'var(--grey-800)', borderRadius: '4px', margin: '0 auto', animation: 'pulse 1.5s infinite' }}/>
            <div style={{ width: '80%', height: '14px', background: 'var(--grey-800)', borderRadius: '4px', margin: '0 auto', animation: 'pulse 1.5s infinite' }}/>
            <div style={{ width: '50%', height: '10px', background: 'var(--grey-800)', borderRadius: '4px', margin: '0 auto', animation: 'pulse 1.5s infinite' }}/>
        </div>
    );
}

export default function PokedexPage({ selectedPokemon, setSelectedPokemon, setPage }) {
    const { pokeData, fetchBasic, prefetchFull } = usePokemonData();
    const pokemon = [...GEN1_POKEMON, ...GEN2_POKEMON, ...GEN3_POKEMON, ...GEN4_POKEMON, ...GEN5_POKEMON];
    const [displayLimit, setDisplayLimit] = useState(24);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortBy, setSortBy] = useState('lowest');
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (selectedPokemon) prefetchFull(selectedPokemon);
    }, [selectedPokemon, prefetchFull]);


    const filteredPokemon = pokemon
        .filter(name => {
            if (search && !name.includes(search.toLowerCase())) return false;
            if (typeFilter && pokeData[name]) {
                if (!pokeData[name].types.includes(typeFilter)) return false;
            }
            return true;
        })

        .sort((a, b) => {
            if (sortBy === 'az') return a.localeCompare(b);
            if (sortBy === 'za') return b.localeCompare(a);
            if (sortBy === 'highest') {
                return pokemon.indexOf(b) - pokemon.indexOf(a);
            }
            return pokemon.indexOf(a) - pokemon.indexOf(b);
        });

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if ( scrollHeight - scrollTop  <= clientHeight + 100) {
            if (displayLimit < pokemon.length) {
                setDisplayLimit(prev => prev+24);
            }
        }
    };

    const overlayRef = useRef(null);

    useEffect(() => {
        if (overlayRef.current) overlayRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }, [selectedPokemon]);
    

    return (
        <div 
            onScroll={handleScroll}
            style={{ 
                position: 'relative', 
                overflowY: selectedPokemon ? 'hidden' : 'auto',
                background: 'var(--black)',
                height: 'calc(100vh - 70px)'
        }}>

            {/* Header */}
            <div style={{ 
                background: 'var(--black)', 
                padding: '24px 16px', 
                borderBottom: '1px solid var(--grey-800)',
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    maxWidth: '800px', 
                    margin: '0 auto' 
                }}>
                    <button onClick={() => setPage('home')}
                        style={{ background:'none', border:'1px solid var(--white)', color:'var(--white)', padding:'10px 24px', cursor:'pointer', fontFamily:'var(--font-display)', fontSize:'14px', letterSpacing:'0.12em', textTransform:'uppercase', transition:'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background='none'}>
                        ← Back
                    </button>
                    
                    <div style={{ 
                        fontFamily: 'var(--font-display)', 
                        fontSize: '28px', 
                        letterSpacing: '0.15em', 
                        textTransform: 'uppercase', 
                        color: 'var(--white)' 
                    }}>
                        Pokédex
                    </div>

                    <div style={{ width: '85px' }} /> 
                </div>
            </div>
            
            {/* Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                padding: '16px',
                maxWidth: '830px',
                margin: '0 auto',
            }}>
                {/* Search */}
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search Pokémon..."
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                        flex: '1 1 200px',
                        padding: '8px 12px',
                        border: '1px solid var(--grey-500)',
                        background: 'var(--grey-800)',
                        fontFamily: 'inherit', 
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none',
                        borderColor: isFocused ? 'var(--grey-300)' : 'var(--grey-500)'
                    }}
                />

                {/* Type filter */}
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid',
                        borderColor: typeFilter ? TYPE_COLORS[typeFilter] : 'var(--grey-500)',
                        background: typeFilter ? TYPE_BG [typeFilter] :'var(--grey-800)',
                        color: 'white',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        outline: 'none',
                    }}
                >
                    <option value="">All Types</option>
                    {ALL_TYPES.map(type => (
                        <option 
                            key={type} 
                            value={type} 
                            style={{ textTransform: 'capitalize'}}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        border: '1px solid var(--grey-500)',
                        background: 'var(--grey-800)',
                        color: 'white',
                        fontSize: '14px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        outline: 'none'
                    }}
                >
                    <option value="lowest">Lowest #</option>
                    <option value="highest">Highest #</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                </select>
            </div>

            <div 
                style={{
                    
                    filter: selectedPokemon ? 'brightness(0.3) blur(2px)' : 'none',
                    transition: 'all 0.3s ease',
                    pointerEvents: selectedPokemon ? 'none' : 'auto',
                    background:'var(--grey-900)',
                    padding: '10px',
                    borderRadius: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                    gap: '15px',
                    maxWidth: '800px',
                    margin: '0 auto',
                
                }}>
                {filteredPokemon.slice(0, displayLimit).map(name => {
                    const data = pokeData[name]
                    if(!data) {
                        fetchBasic(name);
                        return <SkeletonCard key={name}/>
                    }

                    return (
                        <PokedexCard 
                            key={name}
                            name={name}
                            data={data}
                            setSelectedPokemon={setSelectedPokemon}
                            setPage={setPage}
                        />
                    );
                })}
                {filteredPokemon.length === 0 && (
                    <div style={{ color: 'var(--grey-400)', padding: '20px', textAlign: 'center' }}>
                        No Pokémon found.
                    </div>
                )}
            </div>

            {selectedPokemon && (
                <div 
                    onClick={() => {
                        setSelectedPokemon(null)
                        setPage('pokedex')
                    }}
                    ref={overlayRef}
                    style={{
                        position: 'fixed', top: 0, left: 0, right:0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        overflowY: 'auto',
                        zIndex: 100
                }}> 
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '40px 20px 80px',  
                        minHeight: '100%',
                    }}>
                        <Pokedex
                            setPage={setPage}
                            selectedPokemon={pokeData[selectedPokemon]}
                            setSelectedPokemon={setSelectedPokemon}
                        />
                        <div onClick={(e) => e.stopPropagation()}>
                            <PokedexInfo 
                                pokemon={pokeData[selectedPokemon]} 
                                setSelectedPokemon={setSelectedPokemon} 
                                prefetchFull={prefetchFull}
                                setPage={setPage}
                            />
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}