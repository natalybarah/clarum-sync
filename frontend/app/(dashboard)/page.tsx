export const dynamic = 'force-dynamic'
import { getCases, getGapCases, getNotices} from "@/lib/api";
import SummaryCard from "@/components/summary-card";
import Dashboard from "@/components/dashboard";
import SearchBar from "@/components/search-bar";

async function Home({searchParams}: {
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>
}) {

  const resultSearchParams= await searchParams;
  const query= resultSearchParams?.query || '';
  const currentPage= Number(resultSearchParams?.page) || 1
  //casesData.cases is what access directly in the object fetch return response
  const casesData= await getCases(currentPage, query);
  console.log("casesData:", casesData)
  const gapCases= await getGapCases();
  const notices= await getNotices();
  const queueCount= gapCases.length + notices.length


  return (
    <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-6">
              <SummaryCard 
                totalCases={casesData.total} 
                gapCount={gapCases.length} 
                noticeCount={notices.length} 
                cardType="confirmed"
              />
              <SummaryCard 
                  totalCases={casesData.total} 
                  gapCount={gapCases.length} 
                  noticeCount={notices.length} 
                  cardType="gap"
              />
              <SummaryCard 
                  totalCases={casesData.total} 
                  gapCount={gapCases.length} 
                  noticeCount={notices.length} 
                  cardType="pending"
              />
          </div>
            <SearchBar queueCount={queueCount} />
            <Dashboard 
                cases={casesData.cases} 
                notices={notices}
                currentPage={casesData.page}
                totalPages={casesData.total_pages}
             
        
            />
    </div>
  );
}

export default Home;
