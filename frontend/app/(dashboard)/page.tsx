import { getCases} from "@/lib/api";
import { Case} from "@/lib/types";
import SummaryCard from "@/components/summary-card";

async function Home() {
  const cases= await getCases();
 


  return (
    <div>
     
  
        {cases.map((c: Case)=>(
          <h1 key={c.id}>{c.name}</h1>
        ))}
      <SummaryCard/>
      
    </div>
  );
}

export default Home;
