import { getCases} from "@/lib/api";
import { Case} from "@/lib/types";
import { IconCalendarSmile, IconCalendarSad, IconCalendarQuestion } from "@tabler/icons-react";
import SummaryCard from "@/components/summary-card";

async function Home() {
  const cases= await getCases();
 
  const SummaryCardOptions={

   confirmedCard: {
      relevantNum: 45,
      primaryText: "sss",
      secondaryText: "www",
      icon: "ww"
    },

    gapCard:{
      relevantNum: 45,
      primaryText: "sss",
      secondaryText: "www",
      icon: "ww"
    },

    pendingCard:{
      relevantNum: 45,
      primaryText: "sss",
      secondaryText: "www",
      icon: "ww"
    }

  }
 

  return (
    <div>
     
  
        {cases.map((c: Case)=>(
          <div key={c.id}>

            <h1 >{c.name}</h1>
            
          </div>
        ))}
      <div className="flex flex-row gap-6">
        <SummaryCard cases={cases}/>
        <SummaryCard cases={cases}/>
        <SummaryCard cases={cases}/>
      </div>
    </div>
  );
}

export default Home;
