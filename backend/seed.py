import os 
from datetime import date

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client, Client 

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)


'''
cases_response=(
    supabase.table("cases")
    .select("*")
    .execute()
)


case_id_map={}
for case in cases_response.data:
    case_id_map[case["filevine_project_id"]]= case["id"]

for hearing in hearings:
    hearing["case_id"]= case_id_map[hearing["case_id"]]


hearings_response= (
    supabase.table("hearings")
    .insert(hearings)
    .execute()
)

'''