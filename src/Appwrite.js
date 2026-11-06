
import { Client, TablesDB, ID, Query } from 'appwrite'

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)

const tablesDB = new TablesDB(client)

export const UpdateSearchCount = async (searchTerm, movie) => {
  const term = searchTerm?.trim()

  if (!term || !movie?.id) {
    // console.log('Skipping Appwrite update:', { term, movie })
    return
  }

  try {
    // console.log('Searching Appwrite for:', term)

    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [
        Query.equal('searchTerm', [term])
      ]
    })

    const row = result.rows[0]

    if (row) {
      await tablesDB.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: row.$id,
        data: {
          count: row.count + 1
        }
      })

    //   console.log('Search count updated:', term)
    } else {
      await tablesDB.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLE_ID,
        rowId: ID.unique(),
        data: {
          searchTerm: term,
          count: 1,
          movie_id: movie.id,
          poster_url: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : ''
        }
      })

    //   console.log('New search row created:', term)
    }

  } catch (error) {
    console.error('Appwrite Error:', error)
  }
}


export const getTrendingMovies = async () => {
  try {
    const result = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: TABLE_ID,
      queries: [
        Query.limit(5),
        Query.orderDesc('count')
      ]
    })

    return result.rows
  } catch (error) {
    console.error('Error fetching trending movies:', error)
    return []
  }
}


