import React, { useState, useEffect } from 'react'
import hero from '../src/assets/hero-img.png'
import Search from './Components/Search.jsx'
import Spinner from './Components/Spinner.jsx'
import MovieCard from './Components/MovieCard.jsx'

import {UpdateSearchCount, getTrendingMovies} from '../src/Appwrite.js'

const API_BASE_URL = 'https://api.themoviedb.org/3'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {

  const [searchTerm, setSearchTerm] = useState("")
  const [ErrorMessage, setErrorMessage] = useState("")
  const [MovieList, setMovieList] = useState([])
  const [IsLoading, setIsloading] = useState(false)
  // const [DebounceSearchTerm, setDebounceSearchTerm] = useState("")
  const [TrendingMovies, setTrendingMovies] = useState([])



  const fetchMovies = async (query = '') => {
    setIsloading(true)
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

      const response = await fetch(endpoint, API_OPTIONS)

      if (!response.ok) {
        throw new Error("Failed to fetch movies")
      }
      const data = await response.json()
      // console.log(data)

      if (data.response === "False") {
        setErrorMessage(data.error)
        setMovieList([])
        return
      } else {
        setErrorMessage("")
        setMovieList(data.results || [])
      }

      if (query.trim() && data.results?.length > 0) {
        await UpdateSearchCount(query, data.results[0])
      }

    } catch (error) {
      console.error("Error Fetching Movies", error)
      setErrorMessage("Error Fetching Movies")
    } finally {
      setIsloading(false)
    }
  }

  const LoadTrendingMovies = async ()=>{
    try{
      const trendingMovies = await getTrendingMovies()
      setTrendingMovies(trendingMovies)
    }catch(error){
      console.error("Error Fetching Trending Movies", error)
    
    }
  }

  useEffect(() => {
    fetchMovies(searchTerm)
   
  }, [searchTerm])
  useEffect(() => {
   LoadTrendingMovies()
   
  }, [])

  

  return (
    <main>
      <div className="pattern" />

      <div className='wrapper'>

        <header>
          <img src={hero} alt="hero banner" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

      {TrendingMovies.length>0 &&(
        <section className="trending">
          <h2 className='mt-4'>Trending Movies</h2>
          <ul>
            {TrendingMovies.map((movie ,index) => (
              <li key={movie.$id}>
                <p>{index + 1}</p>
                <img src={movie.poster_url} alt={movie.searchTerm} />
              </li>
            ))}
          </ul>
        </section>
      )}

        <section className="all-movies">
          <h1 className='mt-4'>All Movies</h1>
          {IsLoading ? (
            <Spinner />
          ) : ErrorMessage ? (<p className='text-red-600'>Error : {ErrorMessage}</p>) : (
            <ul>
              {MovieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>

      </div>

    </main>
  )
}

export default App