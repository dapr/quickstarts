from types import SimpleNamespace
from dataclasses import dataclass, is_dataclass, fields
from typing import Any, TypeVar, Type, Dict, get_type_hints, get_origin, get_args, Union
import inspect

T = TypeVar('T')

def convert_to_dataclass(namespace_obj: Any, target_class: Type[T]) -> T:
    """
    Convert a SimpleNamespace (or any object with attributes) to a dataclass instance,
    including nested dataclass objects.
    
    Args:
        namespace_obj: SimpleNamespace or similar object with attributes
        target_class: The target dataclass type
        
    Returns:
        An instance of the target dataclass
    """
    # Handle None case
    if namespace_obj is None:
        return None
    
    # If the target is not a dataclass, return as is
    if not is_dataclass(target_class):
        return namespace_obj
    
    # Dictionary to store the constructor arguments
    kwargs = {}
    
    # Get fields of the dataclass
    dataclass_fields = {field.name: field for field in fields(target_class)}
    
    # Get type hints for proper type handling
    type_hints = get_type_hints(target_class)
    
    # Iterate through all fields in the target dataclass
    for field_name, field in dataclass_fields.items():
        field_type = type_hints.get(field_name, Any)
        
        # If the attribute exists in the source object
        if hasattr(namespace_obj, field_name):
            value = getattr(namespace_obj, field_name)
            
            # Handle nested dataclass
            if value is not None:
                # Direct dataclass type
                if is_dataclass(field_type):
                    kwargs[field_name] = convert_to_dataclass(value, field_type)
                
                # Handle Union and Optional types (Optional is Union[type, None])
                elif get_origin(field_type) is Union:
                    for arg_type in get_args(field_type):
                        if is_dataclass(arg_type):
                            kwargs[field_name] = convert_to_dataclass(value, arg_type)
                            break
                    else:
                        # If no dataclass found in Union, use the value as is
                        kwargs[field_name] = value
                
                # Handle lists, tuples, etc. that might contain dataclasses
                elif get_origin(field_type) in (list, set, tuple, frozenset):
                    # Get the type argument (e.g., List[int] -> int)
                    if get_args(field_type):
                        elem_type = get_args(field_type)[0]
                        
                        if is_dataclass(elem_type):
                            container_type = get_origin(field_type) or list
                            kwargs[field_name] = container_type(
                                convert_to_dataclass(item, elem_type) 
                                for item in value
                            )
                        else:
                            kwargs[field_name] = value
                    else:
                        kwargs[field_name] = value
                
                # Handle dictionaries
                elif get_origin(field_type) is dict:
                    if len(get_args(field_type)) >= 2:
                        key_type, val_type = get_args(field_type)[:2]
                        
                        if is_dataclass(val_type):
                            kwargs[field_name] = {
                                k: convert_to_dataclass(v, val_type)
                                for k, v in value.items()
                            }
                        else:
                            kwargs[field_name] = value
                    else:
                        kwargs[field_name] = value
                
                # Simple attribute, no type conversion needed
                else:
                    kwargs[field_name] = value
            else:
                # Value is None
                kwargs[field_name] = None
        else:
            # Attribute doesn't exist in the source object, might need default value
            # This branch is not needed in your case since you mentioned all fields are present
            pass
    
    # Debug information
    try:
        return target_class(**kwargs)
    except TypeError as e:
        # More informative error message
        missing_fields = str(e)
        existing_attributes = dir(namespace_obj)
        
        print(f"Error creating {target_class.__name__}: {missing_fields}")
        print(f"Available attributes in source: {[attr for attr in existing_attributes if not attr.startswith('_')]}")
        print(f"Fields needed by dataclass: {list(dataclass_fields.keys())}")
        print(f"Converting with: {kwargs}")
        
        # If it's one of the nested objects causing the issue, print more details
        for field_name, field_type in type_hints.items():
            if is_dataclass(field_type) and field_name in kwargs:
                value = getattr(namespace_obj, field_name, None)
                if value is not None:
                    print(f"\nNested object '{field_name}' details:")
                    print(f"  Type expected: {field_type}")
                    print(f"  Available attributes: {[attr for attr in dir(value) if not attr.startswith('_')]}")
        
        raise