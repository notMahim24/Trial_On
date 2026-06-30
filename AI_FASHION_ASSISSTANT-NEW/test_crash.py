from core.agent import agent_executor, system_message
from langchain_core.messages import HumanMessage
import traceback

try:
    messages = [system_message, HumanMessage(content="suggest a green tshirt")]
    response = agent_executor.invoke({"messages": messages})
    print(response["messages"][-1].content)
except Exception as e:
    traceback.print_exc()
