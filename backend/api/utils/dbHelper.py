def paginar(page:int,size:int): 
    return  (page - 1) * size

def totalPages(total:int,size:int):
    return (total + size - 1) // size