const FAST_API_URL= "http://127.0.0.1:8000"

export const getCases= async() =>{
    const data= await fetch(`${FAST_API_URL}/cases`, { cache: 'no-store' })
    if (!data.ok) throw new Error("An error ocurred, failed to fetch cases")
    const cases= await data.json()
    return cases
}

export const getNotices= async()=>{
    const data= await fetch(`${FAST_API_URL}/notices`, { cache: 'no-store' })
    if (!data.ok) throw new Error("An error ocurred, failed to fetch notices")
    const notices= data.json()
    return notices
}

export const getGapCases= async()=>{
    const data= await fetch(`${FAST_API_URL}/cases/gaps`, { cache: 'no-store' })
    if (!data.ok) throw new Error("An error ocurred, failed to fetch cases with gaps")
    const gapCases= data.json()
    return gapCases
}

