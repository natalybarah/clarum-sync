
# Alternative approach for returning an OpenAi response, stripping markdown and code fences
# and generating a python dict
def get_hearing_from_text(raw_notice_text: str) -> dict:
    
    openai_response= openai_client.responses.create(
        model= MODEL,
        input=[
            {"role": "developer", "content": INSTRUCTION},
            {"role": "user", "content": raw_notice_text }
        ]
    )

    raw_openai_output= openai_response.output[0].content[0].text

    # Strip markdown code fences from OpenAi output 

    if raw_openai_output.startswith("```"):
        raw_openai_output = raw_openai_output.split("```")[1]
        if raw_openai_output.startswith("json"):
            raw_openai_output =  raw_openai_output[4:]

    # Parse json and convert to python dict

    hearing_info = json.loads(raw_openai_output.strip())
    return hearing_info

# TEST WITH TESTCASE BASE CLASS

class test_get_hearing_from_text(unittest.TestCase):
    @patch('agent.openai_client') # i creating a mock object of requests.post 
    def test_get_hearing_from_text(self, mock_openai_client: patch):
        mock_openai_client.responses.parse.return_value.output_parsed.model_dump.return_value =  EXTRACTED_HEARING_INFO
        hearing_info=  mock_openai_client.responses.parse.return_value.output_parsed.model_dump.return_value
        result= get_hearing_from_text(TEST_NOTICE_TEXT)  
        self.assertEqual(result,  hearing_info)