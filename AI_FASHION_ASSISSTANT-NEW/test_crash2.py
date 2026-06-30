from core.agent import agent_executor, system_message
from langchain_core.messages import HumanMessage, AIMessage
import traceback

try:
    history = [
        HumanMessage(content="what should wear in party?"),
        AIMessage(content="Ooh, a party is the perfect chance to shine! ... (long message)")
    ]
    messages = [system_message] + history + [HumanMessage(content="suggest a green tshirt")]
    response = agent_executor.invoke({"messages": messages})
    print(response["messages"][-1].content)
except Exception as e:
    traceback.print_exc()
