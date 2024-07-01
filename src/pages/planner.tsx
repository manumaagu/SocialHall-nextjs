import { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import ContentModal from "../modals/ProgramContentModal";
import NoMediasModal from "../modals/NoMediasConnectedModal";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { useAuth } from "@clerk/clerk-react";
import {
  AllSocialMediaContent,
  LinkedinContent,
  TwitterContent,
  YoutubeContent,
} from "../interfaces/social-media";

interface EventInfo {
  timeText: string;
  event: {
    title: string;
  };
}

const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

const PlannerPage = () => {
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isNoMediaModalOpen, setIsNoMediaModalOpen] = useState(false);
  const [postDate, setPostDate] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [medias, setMedias] = useState<string[]>([]);
  const [time, setTime] = useState("");
  const [contents, setContents] = useState<{}>({});
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = useCallback(() => {
    setContents({});
    setIsContentModalOpen(false);
  }, []);

  const handleContentChange = useCallback((content: AllSocialMediaContent) => {
    setContents(content);
  }, []);

  const saveContent = useCallback(async () => {
    const dateTime = `${postDate} ${time}`;
    const dateTimestamp = new Date(dateTime).getTime();

    Object.entries(contents).forEach(async ([network, content]) => {
      const mediaToUpload = new FormData();
      const contentToSend = new FormData();
      contentToSend.append("date", dateTimestamp.toString());

      switch (network.toLowerCase()) {
        case "twitter":
          const twitterContent = content as TwitterContent[];
          twitterContent.forEach((tweet, index) => {
            contentToSend.append(`tweets[${index}]`, tweet.text ?? "");
          });
          break;
        case "linkedin":
          const linkedinContent = content as LinkedinContent;
          contentToSend.append(
            "shareCommentary",
            linkedinContent.shareCommentary
          );
          contentToSend.append(
            "shareMediaCategory",
            linkedinContent.shareMediaCategory
          );
          if (linkedinContent.media?.length ?? 0 > 0) {
            linkedinContent.media?.forEach((media, index) => {
              if (media instanceof File) {
                mediaToUpload.append(`media[${index}]`, media);
              }
            });
          }
          break;
        case "youtube":
          const youtubeContent = content as YoutubeContent;
          contentToSend.append("title", youtubeContent.title ?? "");
          contentToSend.append("description", youtubeContent.description ?? "");
          contentToSend.append("type", youtubeContent.type);
          contentToSend.append("media", youtubeContent.media);
          break;
        default:
          break;
      }

      if (mediaToUpload.has("media[0]")) {

        const response = await fetch(
          `${clientUrl}/api/upload-media/${network}`,
          {
            method: "POST",
            body: mediaToUpload,
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        const assets = data.assets;

        console.log(assets);

        // let mediaArray: { status: string; media: string }[] = [];

        // assets.forEach((media: any) => {
        //   const mediaObj = {
        //     status: "READY",
        //     media: media,
        //   };
        //   mediaArray.push(mediaObj);
        // });

        // console.log(mediaArray);

        // mediaArray.forEach((obj, index) => {
        //   contentToSend.append(`media[${index}][status]`, obj.status);
        //   contentToSend.append(`media[${index}][media]`, obj.media);
        // });

        contentToSend.append("assets", JSON.stringify(assets));
      }

      try {
        const response = await fetch(
          `${clientUrl}/api/posts/post/${network}`,
          {
            method: "POST",
            body: contentToSend,
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        getEvents();
      } catch (err) {
        console.error(err);
      }
    });
    closeModal();
  }, [contents, postDate, time, closeModal]);

  const handleDateSelect = useCallback(
    (selectInfo: DateSelectArg) => {
      let selectedDate = null;
      const currentDate = new Date().getTime();
      switch (selectInfo.view.type) {
        case "dayGridMonth":
          selectedDate = new Date(selectInfo.startStr);
          selectedDate.setDate(selectedDate.getDate() + 1);

          if (selectedDate.getTime() >= currentDate) {
            if (medias.length === 0) {
              setIsNoMediaModalOpen(true);
              return;
            }
            setIsContentModalOpen(true);
            setPostDate(selectInfo.startStr);
            setTime(formatTimeFromTimestamp(Date.now()));
          }
          break;
        case "timeGridWeek":
          selectedDate = new Date(selectInfo.startStr);
          selectedDate.setMinutes(selectedDate.getMinutes() + 30);

          if (selectedDate.getTime() >= currentDate) {
            if (medias.length === 0) {
              setIsNoMediaModalOpen(true);
              return;
            }
            setIsContentModalOpen(true);
            setPostDate(selectInfo.startStr.split("T")[0]);
            setTime(selectInfo.startStr.split("T")[1].slice(0, 5));
          }
          break;
        case "timeGridDay":
          selectedDate = new Date(selectInfo.startStr);
          selectedDate.setMinutes(selectedDate.getMinutes() + 30);

          if (selectedDate.getTime() >= currentDate) {
            if (medias.length === 0) {
              setIsNoMediaModalOpen(true);
              return;
            }
            setIsContentModalOpen(true);
            setPostDate(selectInfo.startStr.split("T")[0]);
            setTime(selectInfo.startStr.split("T")[1].slice(0, 5));
          }
          break;
        default:
          break;
      }
    },
    [medias]
  );

  const formatTimeFromTimestamp = (timestamp: number): string => {
    // Move to utils
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const handleEventClick = useCallback(async (clickInfo: EventClickArg) => {
    const { event } = clickInfo;

    if (!event.extendedProps.posted) {
      if (
        window.confirm(
          `Are you sure you want to delete the event '${event.title}'`
        )
      ) {
        const response = await fetch(
          `${clientUrl}/api/events/delete/${event.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        event.remove();
      }
    }
  }, []);

  const renderEventContent = useCallback((eventInfo: EventInfo) => {
    return (
      <>
        <div
          className="flex gap-1 ml-1 items-center overflow-hidden whitespace-nowrap max-w-full text-white"
          title={eventInfo.event.title}
        >
          <b>{eventInfo.timeText}</b>-{" "}
          <span className="text-ellipsis text-white">
            {eventInfo.event.title}
          </span>
        </div>
      </>
    );
  }, []);

  const getEvents = useCallback(async () => {
    try {
      const response = await fetch(`${clientUrl}/api/events/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        setEvents([]);
      }

      if (!response.ok && response.status !== 404) {
        throw new Error("Network response was not ok");
      }

      const events = await response.json();
      setEvents(events);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMedias = useCallback(async () => {
    try {
      const response = await fetch(
        `${clientUrl}/api/auth/connected-profiles`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      const medias = Object.keys(data.profiles);
      setMedias(medias);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    getMedias();
    getEvents();
  }, []);

  return (
    <>
      <div className="mx-12">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <FullCalendar
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                resourceTimelinePlugin,
              ]}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              height={800}
              firstDay={1}
              initialView="dayGridMonth"
              editable={false}
              selectable={true}
              selectMirror={false}
              dayMaxEvents={true}
              weekends={true}
              events={events}
              select={handleDateSelect}
              eventContent={renderEventContent} // custom render function
              eventClick={handleEventClick}
              eventStartEditable={false}
              allDaySlot={false}
              /* you can update a remote database when these fire:
            eventAdd={function(){}}
            eventChange={function(){}}
            eventRemove={function(){}}
            */
              schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
            />
            <ContentModal
              isOpen={isContentModalOpen}
              onClose={closeModal}
              onSave={saveContent}
              date={postDate}
              time={time}
              onTimeChange={setTime}
              content={contents}
              onContentChange={handleContentChange}
              socialMedias={medias}
            ></ContentModal>
            <NoMediasModal
              isOpen={isNoMediaModalOpen}
              onClose={() => setIsNoMediaModalOpen(false)}
            ></NoMediasModal>
          </div>
        )}
      </div>
    </>
  );
};

export default PlannerPage;
