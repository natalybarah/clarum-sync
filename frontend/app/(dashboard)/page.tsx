import { getCases, getGapCases, getNotices} from "@/lib/api";
import { Case} from "@/lib/types";
import SummaryCard from "@/components/summary-card";
import Dashboard from "@/components/dashboard";


async function Home() {
  const cases= await getCases();
  const gapCases= await getGapCases();
  const notices= await getNotices();
console.log("cases main", cases)
  //console.log(gapCases,"gapcases from home")

  return (
    <div>
     
  
        {cases.map((c: Case)=>(
          <div key={c.id}>

            <h1 >{c.name}</h1>
            
          </div>
        ))}
      <div className="flex flex-row gap-6">
        <SummaryCard cases={cases} gapCases={gapCases} notices={notices} cardType="confirmed"/>
        <SummaryCard cases={cases} gapCases={gapCases} notices={notices} cardType="gap"/>
        <SummaryCard cases={cases} gapCases={gapCases} notices={notices} cardType="pending"/>
        
      </div>
        <Dashboard cases={cases}/>
    </div>
  );
}

export default Home;
