"use client";

import React, { useState, useCallback, memo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { Plus, Edit2, Check, Trash, PlusSquare } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";

// カードの型定義
type CardType = {
  id: string;
  content: string;
};

// リストの型定義
type ListType = {
  id: string;
  title: string;
  cards: CardType[];
};

const TrelloCard = memo(
  ({
    card,
    index,
    listId,
    onEdit,
    onDelete,
  }: {
    card: CardType;
    index: number;
    listId: string;
    onEdit: (cardId: string, content: string) => void;
    onDelete: (listId: string, cardId: string) => void;
  }) => {
    return (
      <Draggable draggableId={card.id} index={index}>
        {(provided: any) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-2"
          >
            <Card>
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <span>{card.content}</span>
                  <div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(card.id, card.content)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(listId, card.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    );
  }
);

TrelloCard.displayName = "TrelloCard";

export default function TrelloClone() {
  const [lists, setLists] = useState<ListType[]>([
    {
      id: "list-1",
      title: "To Do",
      cards: [
        { id: "card-1", content: "Task 1" },
        { id: "card-2", content: "Task 2" },
      ],
    },
    {
      id: "list-2",
      title: "In Progress",
      cards: [{ id: "card-3", content: "Task 3" }],
    },
    {
      id: "list-3",
      title: "Done",
      cards: [],
    },
  ]);

  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>("");
  const [editingList, setEditingList] = useState<string | null>(null);
  const [editListTitle, setEditListTitle] = useState<string>("");

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    setLists((prevLists) => {
      const newLists = [...prevLists];
      const sourceList = newLists.find(
        (list) => list.id === source.droppableId
      );
      const destList = newLists.find(
        (list) => list.id === destination.droppableId
      );

      if (!sourceList || !destList) {
        return prevLists;
      }

      const [movedCard] = sourceList.cards.splice(source.index, 1);
      destList.cards.splice(destination.index, 0, movedCard);

      return newLists;
    });
  }, []);

  const addCard = useCallback((listId: string) => {
    const newCard: CardType = {
      id: `card-${Date.now()}`,
      content: "New Task",
    };

    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, cards: [...list.cards, newCard] } : list
      )
    );
  }, []);

  const startEditing = useCallback((cardId: string, content: string) => {
    setEditingCard(cardId);
    setEditContent(content);
  }, []);

  const saveEdit = useCallback(
    (listId: string, cardId: string) => {
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? {
                ...list,
                cards: list.cards.map((card) =>
                  card.id === cardId ? { ...card, content: editContent } : card
                ),
              }
            : list
        )
      );
      setEditingCard(null);
    },
    [editContent]
  );

  const startEditingList = useCallback((listId: string, title: string) => {
    setEditingList(listId);
    setEditListTitle(title);
  }, []);

  const saveListEdit = useCallback(
    (listId: string) => {
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId ? { ...list, title: editListTitle } : list
        )
      );
      setEditingList(null);
    },
    [editListTitle]
  );

  const deleteCard = useCallback((listId: string, cardId: string) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? { ...list, cards: list.cards.filter((card) => card.id !== cardId) }
          : list
      )
    );
  }, []);

  const addList = useCallback(() => {
    const newList: ListType = {
      id: `list-${Date.now()}`,
      title: "New List",
      cards: [],
    };

    setLists((prevLists) => [...prevLists, newList]);
  }, []);

  const deleteList = useCallback((listId: string) => {
    setLists((prevLists) => prevLists.filter((list) => list.id !== listId));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Trello Clone</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {lists.map((list) => (
            <div key={list.id} className="w-64 flex-shrink-0">
              <Card>
                <CardHeader>
                  {editingList === list.id ? (
                    <div className="flex items-center">
                      <Input
                        value={editListTitle}
                        onChange={(e) => setEditListTitle(e.target.value)}
                        className="mr-2"
                      />
                      <Button size="sm" onClick={() => saveListEdit(list.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <CardTitle>{list.title}</CardTitle>
                      <div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditingList(list.id, list.title)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteList(list.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <Droppable droppableId={list.id}>
                    {(provided: any) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[50px]"
                      >
                        {list.cards.map((card, index) => (
                          <TrelloCard
                            key={card.id}
                            card={card}
                            index={index}
                            listId={list.id}
                            onEdit={startEditing}
                            onDelete={deleteCard}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <Button
                    onClick={() => addCard(list.id)}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Card
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
          <div className="w-64 flex-shrink-0">
            <Button
              onClick={addList}
              variant="outline"
              className="w-full h-10 mt-10"
            >
              <PlusSquare className="w-4 h-4 mr-2" /> Add List
            </Button>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
