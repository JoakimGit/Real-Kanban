import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from 'convex/_generated/api';
import { Doc, Id } from 'convex/_generated/dataModel';
import { MoreHorizontalIcon, Trash2Icon, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { getUserDisplayName } from '~/utils/user';
import { formatDate } from '~/utils/date';
import { useAuth, useUser } from '@clerk/tanstack-react-start';
import { TaskComment } from 'convex/comments';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

interface CommentsProps {
  taskId: Id<'tasks'>;
  workspaceId: Id<'workspaces'>;
}

export const CommentsList = ({ taskId, workspaceId }: CommentsProps) => {
  const [newComment, setNewComment] = useState('');

  const { data: comments = [], isLoading } = useQuery(
    convexQuery(api.comments.getCommentsByTask, { taskId }),
  );

  const { mutate: createComment } = useMutation({
    mutationFn: useConvexMutation(api.comments.createComment),
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;

    createComment({
      taskId,
      workspaceId,
      text: newComment.trim(),
    });
    setNewComment('');
  };

  if (isLoading) return <div>Loading comments...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <CommentItem key={comment._id} comment={comment} />
        ))}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          className="w-full sm:w-auto"
        >
          Add Comment
        </Button>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: TaskComment;
}

function CommentItem({ comment }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);

  const { data: user } = useQuery(convexQuery(api.users.currentUser, {}));

  const { mutate: updateComment } = useMutation({
    mutationFn: useConvexMutation(api.comments.updateComment),
  });

  const { mutate: deleteComment } = useMutation({
    mutationFn: useConvexMutation(api.comments.deleteComment),
  });

  const handleSave = () => {
    if (!editedText.trim()) return;
    updateComment({
      commentId: comment._id,
      text: editedText.trim(),
    });
    setIsEditing(false);
  };

  const isAuthor = user?._id === comment.author._id;
  return (
    <div className="bg-secondary p-3 rounded-md">
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <div className="flex items-center gap-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={comment.author.clerkUser.image_url}
              alt={getUserDisplayName(comment.author.clerkUser) ?? ''}
            />
            <AvatarFallback>
              {(getUserDisplayName(comment.author.clerkUser) ?? '')[0]}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground capitalize">
            {getUserDisplayName(comment.author.clerkUser)}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(
              comment.lastModified ?? comment._creationTime,
              'P HH:mm',
            )}
          </span>
        </div>

        {isAuthor && (
          <div className="flex gap-x-2">
            <PencilIcon
              className="size-5 text-primary cursor-pointer"
              onClick={() => setIsEditing(true)}
            />
            <Trash2Icon
              className="size-5 text-destructive cursor-pointer"
              onClick={() => deleteComment({ commentId: comment._id })}
            />
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="min-h-[60px]"
          />
          <div className="flex gap-x-2">
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm">{comment.text}</p>
      )}
    </div>
  );
}
