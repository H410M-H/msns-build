import { NextResponse } from 'next/server'

interface GoogleReview {
  author_name: string
  rating: number
  text: string
  relative_time_description: string
}

interface PlaceDetailsResponse {
  result?: {
    reviews?: GoogleReview[]
  }
  status: string
}

export async function GET() {
  const PLACE_ID = 'ChIJ4RLlGhQnHzkRzxw0rAyLcko'
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY

  if (!API_KEY) {
    return NextResponse.json(
      { error: 'Google Maps API key not configured', reviews: [] },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=review&key=${API_KEY}`
    )
    
    const data = await response.json() as PlaceDetailsResponse

    if (data.status !== 'OK' || !data.result?.reviews) {
      return NextResponse.json({ reviews: [] })
    }

    const filteredReviews = data.result.reviews.filter(
      (review) => review.rating >= 4
    )

    return NextResponse.json({ reviews: filteredReviews })
  } catch (error) {
    console.error('Google Places API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews', reviews: [] },
      { status: 500 }
    )
  }
}