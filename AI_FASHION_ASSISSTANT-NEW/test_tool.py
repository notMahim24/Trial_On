from tools.product_search import search_products

try:
    res = search_products.invoke({"search_term": "green tshirt"})
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
