from pydantic import BaseModel
from typing import List
from datetime import date


class ScheduleBlock(BaseModel):
    id: int
    title: str
    category: str = "Focus"
    startHour: int
    duration: float = 1
    day: str = str(date.today())


blocks_db: List[ScheduleBlock] = []


def get_blocks():
    return blocks_db


def add_block(block: ScheduleBlock):
    blocks_db.append(block)
    return block


def delete_block(block_id: int):
    global blocks_db
    blocks_db = [block for block in blocks_db if block.id != block_id]
    return {"message": "Block deleted successfully"}